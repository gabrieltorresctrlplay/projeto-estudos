import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

// --- Types ---

export interface ChatUser {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isOnline?: boolean
  lastSeen?: Timestamp
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUser?: ChatUser // Hydrated
  toUserEmail: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Timestamp
}

export interface Friendship {
  id: string
  users: string[] // [uid1, uid2]
  friend?: ChatUser // The "other" person (hydrated for UI)
  status: 'active' | 'blocked'
  createdAt: Timestamp
}

export interface ChatMessage {
  id: string
  text: string
  senderId: string
  createdAt: Timestamp
  readBy: string[]
}

export interface ChatSession {
  id: string
  participants: string[]
  otherUser?: ChatUser // Hydrated
  lastMessage?: {
    text: string
    senderId: string
    createdAt: Timestamp
    seen: boolean
  }
  typing?: Record<string, boolean>
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// --- Service Methods ---

export const chatService = {
  // 1. User Discovery
  async searchUserByEmail(email: string): Promise<ChatUser | null> {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as ChatUser
  },

  async getUserProfile(userId: string): Promise<ChatUser | null> {
    const docRef = doc(db, 'users', userId)
    // 1. Try fetching by Document ID (default assumption)
    // For MVP fetch once. In real app maybe use centralized users cache.
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      const data = snapshot.data()
      return {
        id: snapshot.id,
        displayName: data.name || data.displayName, // fallback
        email: data.email,
        photoURL: data.photoURL || data.avatarUrl, // fallback
      } as ChatUser
    }

    // 2. Fallback: Try fetching by 'uid' field
    // This handles cases where users are stored with Auto-IDs but we referenced them by Auth UID
    try {
      const q = query(collection(db, 'users'), where('uid', '==', userId), limit(1))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        const data = docSnap.data()
        return {
          id: docSnap.id,
          displayName: data.name || data.displayName,
          email: data.email,
          photoURL: data.photoURL || data.avatarUrl,
        } as ChatUser
      }
    } catch (e) {
      console.warn('GetUserProfile fallback failed', e)
    }

    return null
  },

  // 2. Friend Requests
  async sendFriendRequest(fromUser: ChatUser, toEmail: string) {
    if (fromUser.email === toEmail) throw new Error('Você não pode adicionar a si mesmo.')

    // Check if request already exists
    const requestsRef = collection(db, 'friend_requests')
    const q = query(
      requestsRef,
      where('fromUserId', '==', fromUser.id),
      where('toUserEmail', '==', toEmail),
      where('status', '==', 'pending'),
    )
    const existing = await getDocs(q)
    if (!existing.empty) throw new Error('Pedido de amizade já enviado.')

    // Create request
    await addDoc(requestsRef, {
      fromUserId: fromUser.id,
      fromUserSnapshot: {
        // Store minimal snapshot for quicker list display
        displayName: fromUser.displayName,
        photoURL: fromUser.photoURL,
        email: fromUser.email,
      },
      toUserEmail: toEmail,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  },

  // Subscribe to requests I RECEIVED (where toUserEmail == myUser.email)
  subscribeToIncomingRequests(userEmail: string, callback: (requests: FriendRequest[]) => void) {
    const q = query(
      collection(db, 'friend_requests'),
      where('toUserEmail', '==', userEmail),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    )

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          fromUser: data.fromUserSnapshot, // Map snapshot to friendly prop
        }
      }) as FriendRequest[]
      callback(requests)
    })
  },

  async respondToRequest(
    requestId: string,
    action: 'accepted' | 'rejected',
    fromUserId?: string,
    myUserId?: string,
  ) {
    const reqRef = doc(db, 'friend_requests', requestId)

    if (action === 'rejected') {
      await updateDoc(reqRef, { status: 'rejected' })
      return
    }

    // If accepted, create friendship AND update request
    if (action === 'accepted' && fromUserId && myUserId) {
      // 1. Mark request accepted
      await updateDoc(reqRef, { status: 'accepted' })

      // 2. Create friendship
      // Check if already exists just in case
      const friendsRef = collection(db, 'friendships')
      // Complex composite key check skipped for MVP, relying on UI flow

      await addDoc(friendsRef, {
        users: [fromUserId, myUserId],
        status: 'active',
        createdAt: serverTimestamp(),
      })
    }
  },

  // 3. Friends List
  subscribeToFriends(userId: string, callback: (friends: Friendship[]) => void) {
    // Firestore array-contains query
    // Removed 'status' filter from query to avoid composite index requirement
    const q = query(collection(db, 'friendships'), where('users', 'array-contains', userId))

    return onSnapshot(
      q,
      (snapshot) => {
        const friendships: Friendship[] = []

        snapshot.forEach((doc) => {
          const data = doc.data() as Friendship

          // Client-side filtering
          if (data.status === 'active') {
            // Avoid ID collision in TS
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _, ...rest } = data
            friendships.push({ id: doc.id, ...rest } as Friendship)
          }
        })

        callback(friendships)
      },
      (error) => {
        console.error('Error subscribing to friends:', error)
      },
    )
  },

  // 4. Chat & Messages
  async createOrGetChat(otherUserId: string, myUser: ChatUser): Promise<string> {
    // 1. Check if chat already exists
    // Ideally we store chatIds in user profile or friendship, but for MVP we query
    // Firestore limitation: array-contains only allows one value.
    // We can't query "participants contains A AND participants contains B" easily without composite index.
    // Workaround: Query for chats where I am a participant, then filter in client (not scalable but 100% fine for MVP).
    const chatsRef = collection(db, 'chats')
    const q = query(chatsRef, where('participants', 'array-contains', myUser.id))
    const snapshot = await getDocs(q)

    const existingChat = snapshot.docs.find((doc) => {
      const data = doc.data()
      return data.participants.includes(otherUserId)
    })

    if (existingChat) {
      return existingChat.id
    }

    // 2. Create new chat
    const newChatRef = await addDoc(chatsRef, {
      participants: [myUser.id, otherUserId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      typing: {},
    })

    return newChatRef.id
  },

  subscribeToChats(userId: string, callback: (chats: ChatSession[]) => void) {
    // Removed orderBy('updatedAt') from query to avoid composite index requirement
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId))

    return onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatSession[]

        // Client-side sorting
        chats.sort((a, b) => {
          const tA = a.updatedAt?.toMillis?.() || (a.updatedAt?.seconds || 0) * 1000 || 0
          const tB = b.updatedAt?.toMillis?.() || (b.updatedAt?.seconds || 0) * 1000 || 0
          return tB - tA
        })

        callback(chats)
      },
      (error) => {
        console.error('Error subscribing to chats:', error)
      },
    )
  },

  async sendMessage(chatId: string, text: string, senderId: string) {
    const chatRef = doc(db, 'chats', chatId)
    const messagesRef = collection(chatRef, 'messages')

    // Batch write for atomicity (Message + Chat Update)
    // For MVP, just two awaits is fine, but let's be safe-ish
    await addDoc(messagesRef, {
      text,
      senderId,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    })

    await updateDoc(chatRef, {
      lastMessage: {
        text,
        senderId,
        createdAt: Timestamp.now(), // ServerTimestamp sometimes behaves oddly in nested objects during optimistic updates
        seen: false,
      },
      updatedAt: serverTimestamp(),
    })
  },

  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]
      callback(messages)
    })
  },
}

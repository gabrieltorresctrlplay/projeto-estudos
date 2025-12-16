import { useEffect, useState } from 'react'
import {
  chatService,
  type ChatSession,
  type ChatUser,
  type FriendRequest,
  type Friendship,
} from '@/features/chat-lab/services/chatService'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, MessageSquare, Users } from 'lucide-react'

import { FriendRequestDialog } from './FriendRequestDialog'

interface ChatSidebarProps {
  onSelectFriend: (friend: ChatUser) => void
}

// Tipo para friendship com amigo hidratado
type FriendshipWithUser = Friendship & { friend: ChatUser | null }

// Helper para formatar horário do chat (estilo WhatsApp)
function formatChatTime(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  if (isYesterday(date)) {
    return 'Ontem'
  }
  return format(date, 'dd/MM/yy', { locale: ptBR })
}

export function ChatSidebar({ onSelectFriend }: ChatSidebarProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<FriendshipWithUser[]>([])
  const [chats, setChats] = useState<ChatSession[]>([])
  const { user: currentUser } = useOrganizationContext()

  // Subscription para solicitações de amizade e lista de amigos
  useEffect(() => {
    if (!currentUser?.email || !currentUser?.uid) return

    // 1. Listen for incoming friend requests
    const unsubscribeRequests = chatService.subscribeToIncomingRequests(
      currentUser.email,
      (data) => {
        setRequests(data)
      },
    )

    // 2. Listen for accepted friends
    const unsubscribeFriends = chatService.subscribeToFriends(
      currentUser.uid,
      async (friendships) => {
        // Hydrate friends (fetch their profiles)
        const currentUid = currentUser.uid
        const friendsWithData = await Promise.all(
          friendships.map(async (f) => {
            const friendId = f.users.find((uid) => uid !== currentUid)
            if (!friendId) return null
            try {
              const user = await chatService.getUserProfile(friendId)
              return { ...f, friend: user }
            } catch {
              return null
            }
          }),
        )
        setFriends(friendsWithData.filter((f): f is FriendshipWithUser => f !== null))
      },
    )

    // 3. Listen for active chats and hydrate other users
    const unsubscribeChats = chatService.subscribeToChats(currentUser.uid, async (chatList) => {
      // Hydrate other users for each chat
      const currentUid = currentUser.uid
      const chatsWithHydratedUsers = await Promise.all(
        chatList.map(async (chat) => {
          // Se já tem otherUser hidratado, usar
          if (chat.otherUser?.displayName) return chat

          // Encontrar o ID do outro participante
          const otherUserId = chat.participants.find((id) => id !== currentUid)
          if (!otherUserId) return chat

          try {
            const otherUser = await chatService.getUserProfile(otherUserId)
            return { ...chat, otherUser: otherUser || undefined }
          } catch {
            return chat
          }
        }),
      )
      setChats(chatsWithHydratedUsers)
    })

    // Cleanup all subscriptions
    return () => {
      unsubscribeRequests()
      unsubscribeFriends()
      unsubscribeChats()
    }
  }, [currentUser])

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!currentUser) return
    try {
      await chatService.respondToRequest(
        request.id,
        'accepted',
        request.fromUserId,
        currentUser.uid,
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleRejectRequest = async (request: FriendRequest) => {
    try {
      await chatService.respondToRequest(request.id, 'rejected')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <aside className="border-border flex h-full w-full flex-col border-r md:w-[350px] lg:w-[400px]">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <FeatureIcon
            icon={MessageSquare}
            className="h-8 w-8"
            iconClassName="h-4 w-4"
          />
          <h1 className="text-foreground font-semibold">Chat</h1>
        </div>
        <div className="flex items-center gap-1">
          <FriendRequestDialog />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="chats"
        className="flex flex-1 flex-col"
      >
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chats">Conversas</TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="relative"
            >
              Contatos
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                  <span className="bg-destructive relative inline-flex h-3 w-3 rounded-full"></span>
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chats List */}
        <TabsContent
          value="chats"
          className="mt-0 flex-1 overflow-hidden"
        >
          <ScrollArea className="h-full px-2 py-2">
            {chats.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center text-sm">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Você ainda não tem conversas iniciadas.</p>
                <p className="mt-1 text-xs">
                  Vá em <strong>Contatos</strong> para iniciar um papo!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => {
                  // Encontrar o outro participante
                  const otherUserId = chat.participants.find((id) => id !== currentUser?.uid)
                  const otherUserData = chat.otherUser

                  return (
                    <button
                      key={chat.id}
                      onClick={async () => {
                        // Se já temos os dados do outro usuário, usar diretamente
                        if (otherUserData) {
                          onSelectFriend(otherUserData)
                        } else if (otherUserId) {
                          // Caso contrário, buscar o perfil
                          const profile = await chatService.getUserProfile(otherUserId)
                          if (profile) {
                            onSelectFriend(profile)
                          }
                        }
                      }}
                      className="hover:bg-accent flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={otherUserData?.photoURL || undefined} />
                        <AvatarFallback>
                          {otherUserData?.displayName?.slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-foreground truncate font-medium">
                            {otherUserData?.displayName || 'Usuário'}
                          </h4>
                          {chat.lastMessage?.createdAt && (
                            <span className="text-muted-foreground text-xs">
                              {formatChatTime(chat.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {chat.lastMessage?.text || 'Nenhuma mensagem ainda'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Contacts List */}
        <TabsContent
          value="contacts"
          className="mt-0 flex flex-1 flex-col overflow-hidden"
        >
          {/* Pending Requests Section */}
          <AnimatePresence>
            {requests.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-muted border-b"
              >
                <div className="space-y-2 p-2">
                  <div className="text-muted-foreground flex items-center gap-2 px-2 text-xs font-semibold uppercase">
                    <Bell className="h-3 w-3" /> Solicitações ({requests.length})
                  </div>
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-background flex items-center justify-between rounded-lg border p-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={req.fromUser?.photoURL || undefined} />
                          <AvatarFallback>
                            {req.fromUser?.displayName?.slice(0, 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="text-foreground font-medium">
                            {req.fromUser?.displayName || req.toUserEmail || 'Usuário'}
                          </p>
                          <p className="text-muted-foreground text-[10px]">quer ser seu amigo</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label="Recusar solicitação"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={() => handleRejectRequest(req)}
                        >
                          ×
                        </Button>
                        <Button
                          size="icon"
                          aria-label="Aceitar solicitação"
                          className="h-7 w-7"
                          onClick={() => handleAcceptRequest(req)}
                        >
                          ✓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="flex-1 px-2 py-2">
            {/* Friends List placeholder - logic coming next */}
            {friends.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center text-sm">
                <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Seus amigos aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {friends.map((friendship) => (
                  <button
                    key={friendship.id}
                    onClick={() => friendship.friend && onSelectFriend(friendship.friend)}
                    className="hover:bg-accent flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={friendship.friend?.photoURL || undefined} />
                      <AvatarFallback>{friendship.friend?.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-foreground truncate font-medium">
                        {friendship.friend?.displayName || 'Usuário'}
                      </h4>
                      <p className="text-muted-foreground truncate text-xs">
                        {friendship.friend?.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

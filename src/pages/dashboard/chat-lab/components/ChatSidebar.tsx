import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, MessageSquare, Users } from 'lucide-react'

import { chatService, type ChatUser, type FriendRequest } from '@/lib/chatService'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { FriendRequestDialog } from './FriendRequestDialog'

interface ChatSidebarProps {
  onSelectFriend: (friend: ChatUser) => void
}

export function ChatSidebar({ onSelectFriend }: ChatSidebarProps) {
  // const [activeTab, setActiveTab] = useState('chats') // Future use
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<any[]>([]) // TODO: Type this properly with Friendship + FriendUser
  const { user: currentUser } = useOrganizationContext()

  useEffect(() => {
    if (!currentUser?.email) return

    // Listen for incoming friend requests
    const unsubscribe = chatService.subscribeToIncomingRequests(currentUser.email, (data) => {
      setRequests(data)
    })

    return () => unsubscribe()
    // Listen for accepted friends
    if (!currentUser) return
    const unsubscribeFriends = chatService.subscribeToFriends(
      currentUser!.uid,
      async (friendships) => {
        // Hydrate friends (fetch their profiles)
        // Optimization: In a real app we would have a user cache or get user from a 'users' map
        // For MVP we fetch one by one (ok for small lists)
        const currentUid = currentUser!.uid
        const friendsWithData = await Promise.all(
          friendships.map(async (f) => {
            const friendId = f.users.find((uid) => uid !== currentUid)
            if (!friendId) return null
            try {
              // We use the search method as a quick way to get user data by ID logic if we had it exposed
              // Or better, expose a getUser(id) in service.
              // Let's create a quick helper or just use what we have.
              // Wait, searchUserByEmail is by email. We need by ID.
              // I will add a method getUserById momentarily or simulate it.
              // Actually, let's optimize: The friendship doesn't have the friend data directly.
              // Let's assume for MVP we fetch it.
              // Workaround: We will fetch the user document.
              const user = await chatService.getUserProfile(friendId)
              return { ...f, friend: user }
            } catch (e) {
              return null
            }
          }),
        )
        setFriends(friendsWithData.filter(Boolean))
      },
    )

    return () => {
      unsubscribe()
      unsubscribeFriends()
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
    <aside className="border-border bg-card flex h-full w-full flex-col border-r md:w-[350px] lg:w-[400px]">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <MessageSquare className="text-primary h-4 w-4" />
          </div>
          <h1 className="text-lg font-semibold">Chat</h1>
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
            <div className="text-muted-foreground py-10 text-center text-sm">
              Você ainda não tem conversas iniciadas.
              <br />
              Vá em <strong>Contatos</strong> para iniciar um papo!
            </div>
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
                className="bg-muted/30 border-b"
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
                          <p className="font-medium">
                            {req.fromUser?.displayName || req.toUserEmail || 'Usuário'}
                          </p>
                          <p className="text-muted-foreground text-[10px]">quer ser seu amigo</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={() => handleRejectRequest(req)}
                        >
                          <span className="sr-only">Recusar</span>×
                        </Button>
                        <Button
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAcceptRequest(req)}
                        >
                          <span className="sr-only">Aceitar</span>✓
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
                      <AvatarImage src={friendship.friend?.photoURL} />
                      <AvatarFallback>{friendship.friend?.displayName?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate font-medium">
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

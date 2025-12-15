import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

import { authService } from '@/lib/auth'
import { chatService, type ChatUser } from '@/lib/chatService'
import { cn } from '@/lib/utils'

import { ChatSidebar } from './components/ChatSidebar'
import { ChatWindow } from './components/ChatWindow'

// Placeholder components - will be extracted later

const EmptyState = () => (
  <div className="bg-muted/30 flex flex-1 flex-col items-center justify-center p-8 text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="max-w-md space-y-4"
    >
      <div className="bg-primary/5 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <MessageSquare className="text-primary/50 h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">WhatsApp Web Style</h2>
      <p className="text-muted-foreground">
        Selecione uma conversa ou inicie um novo chat para começar a enviar mensagens em tempo real.
      </p>
      <div className="text-muted-foreground/50 flex justify-center gap-4 pt-4 text-xs">
        <span>Framer Motion</span>
        <span>•</span>
        <span>React Virtuoso</span>
        <span>•</span>
        <span>Firestore Realtime</span>
      </div>
    </motion.div>
  </div>
)

export default function ChatLabPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null)

  const handleSelectFriend = async (friend: ChatUser) => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) return // Should be handled by layout auth check

    // Optimistic UI could be added here, but for now we wait for chat ID
    try {
      const myChatUser: ChatUser = {
        id: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      }
      const chatId = await chatService.createOrGetChat(friend.id, myChatUser)
      setOtherUser(friend)
      setSelectedChatId(chatId)
    } catch (error) {
      console.error('Error opening chat', error)
    }
  }

  return (
    <div className="bg-background flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar - Hidden on mobile if chat is open */}
      <div
        className={cn(
          'h-full w-full flex-shrink-0 transition-all duration-300 md:w-auto',
          selectedChatId ? 'hidden md:block' : 'block',
        )}
      >
        <ChatSidebar onSelectFriend={handleSelectFriend} />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          'bg-background flex h-full min-w-0 flex-1 flex-col',
          !selectedChatId && 'hidden md:flex',
        )}
      >
        {selectedChatId && otherUser ? (
          // Dynamic Import to avoid cycle or just better code splitting if needed,
          // but here we just use the component. Wait, I need to import ChatWindow.
          <ChatWindow
            chatId={selectedChatId}
            otherUser={otherUser}
            onBack={() => setSelectedChatId(null)}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

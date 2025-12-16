import { useEffect, useRef, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { MoreVertical, Phone, Send, Video } from 'lucide-react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'

import { chatService, type ChatMessage, type ChatUser } from '@/lib/chatService'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface ChatWindowProps {
  chatId: string
  otherUser: ChatUser
  onBack?: () => void
}

export function ChatWindow({ chatId, otherUser, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const { user: currentUser } = useOrganizationContext()

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages)
    })
    return () => unsubscribe()
  }, [chatId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !currentUser) return

    const text = inputText
    setInputText('') // Optimistic clear
    setIsSending(true)

    try {
      await chatService.sendMessage(chatId, text, currentUser.uid)
      // Scroll handling is done by followOutput in Virtuoso
    } catch (error) {
      console.error('Failed to send message', error)
      setInputText(text) // Restore on fail
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-muted relative flex h-full flex-col">
      {/* WhatsApp-like background pattern layer */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-[0.06]"></div>

      {/* Header */}
      <header className="bg-card z-10 flex items-center justify-between border-b p-3 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && ( // Only show on mobile
            <Button
              variant="ghost"
              size="icon"
              aria-label="Voltar para lista de conversas"
              className="md:hidden"
              onClick={onBack}
            >
              {/* Back Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          )}
          <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
            <AvatarImage src={otherUser.photoURL || undefined} />
            <AvatarFallback>{otherUser.displayName?.substring(0, 2) || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex cursor-pointer flex-col">
            <span className="text-foreground text-sm font-semibold">
              {otherUser.displayName || 'Usuário'}
            </span>
            <span className="text-muted-foreground text-xs">
              {otherUser.isOnline ? 'Online' : 'Visto por último hoje às 10:00'}
            </span>
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Iniciar chamada de vídeo"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Iniciar chamada de voz"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Dados do contato</DropdownMenuItem>
              <DropdownMenuItem>Limpar conversa</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Bloquear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages List */}
      <div className="relative z-0 flex-1 overflow-hidden">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          initialTopMostItemIndex={messages.length - 1} // Start at bottom
          followOutput={(isAtBottom) => (isAtBottom ? 'smooth' : false)} // Auto-scroll if at bottom
          alignToBottom // Important for chat
          itemContent={(_index, msg) => {
            const isMe = msg.senderId === currentUser?.uid
            return (
              <div className={cn('flex px-4 py-1', isMe ? 'justify-end' : 'justify-start')}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                    'relative max-w-[80%] rounded-lg px-3 py-1.5 text-sm wrap-break-word shadow-sm md:max-w-[60%]',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card text-card-foreground rounded-tl-none',
                  )}
                >
                  <p>{msg.text}</p>
                  <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                    {isMe && (
                      <span>✓✓</span> // Blue ticks placeholder
                    )}
                  </span>
                </motion.div>
              </div>
            )
          }}
        />
      </div>

      {/* Input Area */}
      <div className="bg-card z-10 border-t p-3">
        <form
          className="bg-muted ring-ring flex items-end gap-2 rounded-3xl border p-1.5 transition-all focus-within:ring-1"
          onSubmit={handleSendMessage}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Inserir emoji"
            className="text-muted-foreground h-10 w-10 shrink-0 rounded-full"
          >
            <span className="text-xl">😊</span>
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite uma mensagem"
            className="h-auto max-h-32 min-h-[44px] resize-none border-0 bg-transparent px-2 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar mensagem"
            className={cn(
              'h-10 w-10 shrink-0 rounded-full transition-all',
              !inputText.trim() ? 'opacity-50' : 'opacity-100',
            )}
            disabled={!inputText.trim() || isSending}
          >
            <Send className="ml-0.5 h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

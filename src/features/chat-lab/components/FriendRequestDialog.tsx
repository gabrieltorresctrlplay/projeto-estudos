import { useState } from 'react'
import { chatService, type ChatUser } from '@/features/chat-lab/services/chatService'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
// import { useToast } from '@/shared/hooks/use-toast' -> Removed
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Check, Loader2, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner' // Sonner import

export function FriendRequestDialog() {
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [foundUser, setFoundUser] = useState<ChatUser | null>(null)
  const [searched, setSearched] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // const { toast } = useToast() -> Removed

  const { user: currentUser } = useOrganizationContext()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSearching(true)
    setFoundUser(null)
    setSearched(false)

    try {
      if (email === currentUser?.email) {
        throw new Error('Você não pode adicionar a si mesmo.')
      }

      const user = await chatService.searchUserByEmail(email)
      setFoundUser(user)
    } catch (error) {
      // Silent catch for search logic, user not found is just null
      console.error(error)
      if (error instanceof Error && error.message.includes('si mesmo')) {
        toast.error('Ops!', { description: error.message })
      }
    } finally {
      setIsSearching(false)
      setSearched(true)
    }
  }

  const handleDisplayDialog = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset state on close
      setEmail('')
      setFoundUser(null)
      setSearched(false)
    }
  }

  const handleSendRequest = async () => {
    if (!foundUser || !currentUser) return

    setIsSending(true)
    try {
      // Create minimal ChatUser object from currentUser to send
      const fromUser: ChatUser = {
        id: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      }

      await chatService.sendFriendRequest(fromUser, foundUser.email!)
      toast.success('Convite enviado!', {
        description: `Solicitação enviada para ${foundUser.displayName || foundUser.email}.`,
      })
      handleDisplayDialog(false)
    } catch (error) {
      toast.error('Erro ao enviar', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleDisplayDialog}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
        >
          <UserPlus className="h-5 w-5" />
          <span className="sr-only">Adicionar amigo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Amigo</DialogTitle>
          <DialogDescription>Digite o e-mail para buscar e enviar um convite.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSearch}
          className="flex gap-2"
        >
          <div className="grid flex-1 gap-2">
            <Label
              htmlFor="email"
              className="sr-only"
            >
              Email
            </Label>
            <Input
              id="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            aria-label="Buscar usuário"
            disabled={isSearching || !email}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>

        {searched && !foundUser && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            <p>Nenhum usuário encontrado com este e-mail.</p>
          </div>
        )}

        {foundUser && (
          <div className="bg-muted mt-2 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={foundUser.photoURL || undefined} />
                <AvatarFallback>
                  {foundUser.displayName?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="text-foreground leading-none font-medium">
                  {foundUser.displayName || 'Sem nome'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{foundUser.email}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSendRequest}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Adicionar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { UserProfile } from '@/types'
import { Loader2, Save, User } from 'lucide-react'

import { userService } from '@/lib/userService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Profile() {
  const { user } = useOrganizationContext()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [success, setSuccess] = useState(false)

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      const { data } = await userService.getUserProfile(user.uid)
      if (data) {
        setProfile(data)
        setDisplayName(data.displayName || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setSuccess(false)

    await userService.updateDisplayName(user.uid, displayName)

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perfil</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Seus dados vinculados à conta Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
                <User className="h-10 w-10" />
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-sm">Foto vinculada à sua conta Google</p>
            </div>
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-muted-foreground text-xs">
              Email vinculado à sua conta Google (não editável)
            </p>
          </div>

          {/* Display Name (editable) */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
            {success && <span className="text-sm text-green-500">Salvo com sucesso!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

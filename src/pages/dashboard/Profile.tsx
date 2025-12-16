import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { UserProfile } from '@/types'
import { Loader2, Save, User } from 'lucide-react'

import { userService } from '@/lib/userService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeatureIcon } from '@/components/ui/feature-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileSkeleton } from '@/components/skeletons/PageSkeleton'

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
    return <ProfileSkeleton />
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Perfil
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Seus dados vinculados à conta Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            {profile?.photoURL ? (
              <div className="group relative">
                <img
                  src={profile.photoURL}
                  alt={`Foto de perfil de ${profile.displayName || 'usuário'}`}
                  className="ring-border relative h-24 w-24 rounded-full object-cover shadow-lg ring-2"
                />
              </div>
            ) : (
              <div className="group relative">
                <FeatureIcon
                  icon={User}
                  className="h-24 w-24"
                  iconClassName="h-12 w-12"
                />
              </div>
            )}
            <div>
              <p className="text-lg font-medium">Foto do Perfil</p>
              <p className="text-muted-foreground text-sm">Vinculada à sua conta Google</p>
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
              className="bg-muted border-border"
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
              className="bg-input focus:bg-background transition-colors"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shadow-primary/20 shadow-lg transition-all active:scale-95"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
            {success && (
              <span className="text-success animate-fade-in text-sm font-medium">
                Salvo com sucesso!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

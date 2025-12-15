import { Construction } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UnderConstructionProps {
  title: string
  description?: string
}

export default function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="border-border/50 bg-card/50 max-w-md shadow-xl backdrop-blur-sm">
        <div className="from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br to-transparent" />
        <CardHeader className="relative text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner ring-1">
            <Construction className="text-primary h-8 w-8 animate-pulse" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {description || 'Esta funcionalidade está em desenvolvimento'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground relative text-center text-sm">
          <p>Em breve teremos novidades por aqui! 🚀</p>
        </CardContent>
      </Card>
    </div>
  )
}

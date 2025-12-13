import { Construction } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UnderConstructionProps {
  title: string
  description?: string
}

export default function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Construction className="text-muted-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>
            {description || 'Esta funcionalidade está em desenvolvimento'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          <p>Em breve teremos novidades por aqui! 🚀</p>
        </CardContent>
      </Card>
    </div>
  )
}

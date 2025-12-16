import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { Construction } from 'lucide-react'

interface UnderConstructionProps {
  title: string
  description?: string
}

export default function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <FeatureIcon
              icon={Construction}
              variant="outline"
              className="h-16 w-16"
            />
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

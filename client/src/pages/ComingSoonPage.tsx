import { Card } from '../components/ui'

export interface ComingSoonPageProps {
  title: string
  description: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card className="p-10 text-center">
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm">{description}</p>
      </Card>
    </div>
  )
}

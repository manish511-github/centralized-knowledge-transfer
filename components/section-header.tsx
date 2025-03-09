interface SectionHeaderProps {
  title: string
  description?: string
  link?: {
    label: string
    href: string
  }
}

export function SectionHeader({ title, description, link }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}


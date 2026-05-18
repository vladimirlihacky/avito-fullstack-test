type Props = {
  children: React.ReactNode
}

export function AssistantGrid({ children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}

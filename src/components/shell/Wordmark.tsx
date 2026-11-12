export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`pixel ${className ?? ''}`}>
      MAXIME PERO<span className="text-accent">.</span>
    </span>
  )
}

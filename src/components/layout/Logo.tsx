/** Signature typographique : le nom, ponctué d'un point orange brûlé. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display inline-flex whitespace-nowrap leading-none tracking-[-0.02em] ${className}`}>
      Maxime Pero<span className="text-orange">.</span>
    </span>
  )
}

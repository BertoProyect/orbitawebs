/* Símbolo de La Alacena: el arco de la alacena con sus baldas y tres tarros. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden focusable="false">
      <path d="M6.5 28.5V13.5a9.5 9.5 0 0 1 19 0v15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M3.5 28.8h25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7.5 18.6h17M7.5 24.2h17" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10" y="13.4" width="4.4" height="5.2" rx="1.2" fill="#c2563a" />
      <rect x="16.6" y="14.6" width="4.2" height="4" rx="2" fill="#c2563a" />
      <rect x="12.4" y="19.8" width="7.2" height="4.4" rx="1.2" fill="#c2563a" />
    </svg>
  )
}

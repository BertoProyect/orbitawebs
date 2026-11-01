/* Logotipo de Cúspide: contornos de Instrument Sans (símbolo #logo-cuspide en index.html)
   con la tilde de la ú dibujada aparte, en azul. Es la seña de la marca. */
export function Logo({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <svg className={className} viewBox="0 0 3211 1120" aria-hidden="true" focusable="false">
      <use href="#logo-cuspide" fill={tone === 'dark' ? 'var(--night)' : 'var(--white)'} color={tone === 'dark' ? 'var(--night)' : 'var(--white)'} />
      <g transform="translate(6 890)">
        <path
          fill={tone === 'dark' ? 'var(--blue)' : 'var(--sky)'}
          d="M698.7,-598.5 L746.0,-561.5 L912.8,-723.1 A62.0,62.0 0 0 0 815.1,-799.4 Z"
        />
      </g>
    </svg>
  )
}

/* Solo la «ú» con su tilde: el símbolo de la marca. */
export function Mark({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <svg className={className} viewBox="343 220 310 610" aria-hidden="true" focusable="false">
      <g transform="translate(305.5 822.8) scale(0.7214)">
        <path
          fill={tone === 'dark' ? 'var(--night)' : 'var(--white)'}
          d="M200.24 10Q155.28 10 122.1-9.3 88.93-28.59 71.21-63.01 53.5-97.42 53.5-142.67V-510H179.83V-169.7Q179.83-131.27 198.4-112 216.97-92.72 250.64-92.72 281.59-92.72 304.8-107.93 328.01-123.14 341.48-149.69 354.94-176.23 354.94-209.47L369.02-105.61Q346.41-52.33 303.06-21.16 259.71 10 200.24 10ZM359.41 0V-109.56H354.94V-510H481.27V0Z"
        />
        <path
          fill={tone === 'dark' ? 'var(--blue)' : 'var(--sky)'}
          stroke={tone === 'dark' ? 'var(--blue)' : 'var(--sky)'}
          strokeWidth="22"
          strokeLinejoin="round"
          d="M231.7,-598.5 L279.0,-561.5 L445.8,-723.1 A62.0,62.0 0 0 0 348.1,-799.4 Z"
        />
      </g>
    </svg>
  )
}

type LockaLogoProps = {
  size?: number
}

export function LockaLogo({ size = 38 }: LockaLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="locka-shield-gradient" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="50%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#6600cc" />
        </linearGradient>
      </defs>
      <path d="M19 2L4 8v10c0 9 6.5 15.4 15 18 8.5-2.6 15-9 15-18V8L19 2z" fill="url(#locka-shield-gradient)" />
      <path d="M14.5 17.5V15a4.5 4.5 0 019 0v2.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="12" y="17.5" width="14" height="10" rx="2.5" fill="white" />
      <circle cx="19" cy="22" r="1.5" fill="url(#locka-shield-gradient)" />
      <rect x="18.2" y="23" width="1.6" height="2.5" rx="0.8" fill="url(#locka-shield-gradient)" />
    </svg>
  )
}

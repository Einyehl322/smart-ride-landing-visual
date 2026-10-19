const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  external: 'M7 17 17 7M9 7h8v8',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 8h16M4 16h16',
  close: 'M6 6l12 12M18 6 6 18',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  heart: 'M12 20.5l-1.45-1.32C5.4 14.36 2 11.25 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0 1 16.5 2C19.58 2 22 4.42 22 7.5c0 3.75-3.4 6.86-8.55 11.68L12 20.5Z',
  /* Confianza */
  advice: 'M12 3a6 6 0 0 0-3.6 10.8c.6.45.9 1.1.9 1.8V17h5.4v-1.4c0-.7.3-1.35.9-1.8A6 6 0 0 0 12 3ZM9.5 20.5h5',
  sheet: 'M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5ZM14 3.5V8h4M8.5 12h7M8.5 15.5h7',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chat: 'M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5ZM8 10.5h8M8 13.5h5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  link: 'M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7-.1l-3 3A5 5 0 0 0 11.1 21l1.7-1.7',
  compare: 'M4 20V10M12 20V4M20 20v-7M2 20h20',
} as const

export type IconName = keyof typeof PATHS | 'whatsapp' | 'heart-filled' | 'interest'

export function Icon({ name, className = 'btn__icon' }: { name: IconName; className?: string }) {
  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.82.83-3.03-.2-.31a8.22 8.22 0 1 1 6.95 3.84Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.37-2.95c-.25-.44.25-.41.72-1.36.08-.16.04-.3-.02-.42l-.75-1.82c-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03 4.75 4.75 0 0 0 1 2.52 10.86 10.86 0 0 0 4.16 3.68c1.55.67 2.16.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    )
  }

  if (name === 'heart-filled' || name === 'interest') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={name === 'heart-filled' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={name === 'interest' ? '1.75' : '0'} strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS.heart} />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${name === 'arrow' ? 'btn__icon--arrow' : ''}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

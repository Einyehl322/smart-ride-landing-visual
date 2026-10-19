import type { FeatureIconName } from '../../data/features'

/** Iconos lineales discretos para las características del catálogo. */
const PATHS: Record<FeatureIconName, string> = {
  carplay: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 14.5v-8ZM9 20h6M12 17v3M8.5 8.5h2v2h-2zM13.5 8.5h2v2h-2z',
  android: 'M7 10.5h10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6ZM7.5 9a4.5 4.5 0 0 1 9 0M9 4.5l1 1.6M15 4.5l-1 1.6M4.5 11v4M19.5 11v4',
  magnet: 'M6 4h4v8a2 2 0 0 0 4 0V4h4v8a6 6 0 0 1-12 0V4ZM6 8h4M14 8h4',
  drop: 'M12 3.5c3 3.6 6 7 6 10.2a6 6 0 0 1-12 0c0-3.2 3-6.6 6-10.2ZM9.2 14.5a2.8 2.8 0 0 0 2.8 2.8',
  bluetooth: 'M7 7.5l10 9-5 4.5v-18l5 4.5-10 9',
  tire: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 3v5M12 16v5M3 12h5M16 12h5',
  camera: 'M4 8.5A2.5 2.5 0 0 1 6.5 6h7A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 15.5v-7ZM16 10.5l4-2.5v8l-4-2.5',
  remote: 'M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM12 7v.01M10 11h4M12 9v4M10 16.5h.01M14 16.5h.01',
  gauge: 'M4.5 16a7.5 7.5 0 1 1 15 0M12 16l3.5-4.5M7 16h.01M17 16h.01M12 8.5v.01',
  usb: 'M12 3v13M9 6l3-3 3 3M8 10v2l4 2.5M16 9v3.5L12 15M12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  battery: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h11A1.5 1.5 0 0 1 18 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 15.5v-7ZM20.5 10.5v3M7 10v4M10 10v4',
  alert: 'M12 4l9 16H3l9-16ZM12 10v4M12 17v.01',
  pulse: 'M3 12h4l2-5 4 10 2-5h6',
}

export function FeatureIcon({ name, className = 'ficon' }: { name: FeatureIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

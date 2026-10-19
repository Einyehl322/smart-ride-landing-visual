/**
 * PROVISIONAL — render ilustrativo de una pantalla para motocicleta.
 * Se usa mientras no existan fotografías oficiales de los modelos CarPlay.
 * La interfaz en pantalla es genérica y no reproduce ningún software real.
 */
import { useId } from 'react'
import type { RenderTone } from '../../data/types'

const TONES: Record<RenderTone, { top: string; bottom: string; edge: string; neck: string }> = {
  graphite: { top: '#3b3f47', bottom: '#111317', edge: 'rgba(255,255,255,0.2)', neck: '#1b1d22' },
  sand: { top: '#ebe5d9', bottom: '#b8af9f', edge: 'rgba(255,255,255,0.75)', neck: '#a59b8a' },
}

interface Props {
  tone: RenderTone
  title: string
  className?: string
  /** Solo la pantalla: sin manillar ni soporte, cuyo diseño real no se conoce. */
  bare?: boolean
}

export function DisplayRender({ tone, title, className, bare }: Props) {
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `${name}-${uid}`
  const t = TONES[tone]

  return (
    <svg
      viewBox={bare ? '62 42 676 436' : '0 0 800 600'}
      role="img"
      aria-label={title}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      fontFamily="'Geist Variable', system-ui, sans-serif"
    >
      <defs>
        <linearGradient id={id('frame')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.top} />
          <stop offset="1" stopColor={t.bottom} />
        </linearGradient>
        <linearGradient id={id('bar')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5c6169" />
          <stop offset="0.45" stopColor="#c9ccd1" />
          <stop offset="0.55" stopColor="#8b9098" />
          <stop offset="1" stopColor="#2b2e33" />
        </linearGradient>
        <linearGradient id={id('neck')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.neck} />
          <stop offset="0.5" stopColor={t.top} />
          <stop offset="1" stopColor={t.neck} />
        </linearGradient>
        <radialGradient id={id('ball')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor={t.top} />
          <stop offset="1" stopColor={t.bottom} />
        </radialGradient>
        <radialGradient id={id('shadow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('screen')}>
          <rect x="98" y="78" width="604" height="364" rx="18" />
        </clipPath>
      </defs>

      {bare ? null : (
        <>
          {/* sombra de contacto */}
          <ellipse cx="400" cy="590" rx="330" ry="16" fill={`url(#${id('shadow')})`} />

          {/* manillar y soporte */}
          <rect x="30" y="552" width="740" height="26" rx="13" fill={`url(#${id('bar')})`} />
          <rect x="372" y="462" width="56" height="64" rx="12" fill={`url(#${id('neck')})`} />
          <circle cx="400" cy="532" r="27" fill={`url(#${id('ball')})`} />
          <rect x="318" y="544" width="164" height="42" rx="21" fill={`url(#${id('frame')})`} />
          <rect x="318.5" y="544.5" width="163" height="41" rx="20.5" fill="none" stroke={t.edge} strokeOpacity="0.5" />
          <circle cx="346" cy="565" r="5" fill="#000" opacity="0.35" />
          <circle cx="454" cy="565" r="5" fill="#000" opacity="0.35" />
        </>
      )}

      {/* carcasa */}
      <rect x="70" y="50" width="660" height="420" rx="40" fill={`url(#${id('frame')})`} />
      <rect x="71" y="51" width="658" height="418" rx="39" fill="none" stroke={t.edge} strokeWidth="1.5" />
      <rect x="88" y="68" width="624" height="384" rx="26" fill="#040506" />

      {/* pantalla */}
      <g clipPath={`url(#${id('screen')})`}>
        <rect x="98" y="78" width="604" height="364" fill="#10151c" />
        {/* zonas verdes y agua */}
        <rect x="430" y="250" width="150" height="90" rx="12" fill="#13201a" />
        <rect x="250" y="300" width="110" height="140" rx="12" fill="#13201a" />
        <path d="M560 78 C 520 160, 640 220, 600 300 S 660 420, 702 442" stroke="#0f2233" strokeWidth="38" fill="none" />
        {/* calles */}
        <g stroke="#1a212a" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M190 140 H702" />
          <path d="M190 210 H702" />
          <path d="M190 360 H702" />
          <path d="M300 78 V442" />
          <path d="M520 78 V442" />
          <path d="M620 78 V442" />
        </g>
        <g stroke="#26303c" strokeWidth="11" fill="none" strokeLinecap="round">
          <path d="M190 280 C 300 280, 360 250, 420 230 S 560 170, 702 170" />
          <path d="M400 78 V442" />
        </g>
        {/* ruta */}
        <path
          d="M400 442 V330 C 400 300, 410 285, 440 270 L 560 215 C 590 200, 600 190, 640 190"
          stroke="#7088ff"
          strokeOpacity="0.25"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="dr-route"
          pathLength={1}
          d="M400 442 V330 C 400 300, 410 285, 440 270 L 560 215 C 590 200, 600 190, 640 190"
          stroke="#7088ff"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="640" cy="190" r="9" fill="#f5f5f7" />
        <circle cx="640" cy="190" r="4" fill="#4f68ee" />
        {/* posición */}
        <circle cx="400" cy="372" r="15" fill="#7088ff" fillOpacity="0.25" />
        <circle cx="400" cy="372" r="9" fill="#f5f5f7" />
        <path d="M400 366 L405 377 L400 374 L395 377 Z" fill="#4f68ee" />

        {/* indicación */}
        <rect x="214" y="96" width="232" height="72" rx="14" fill="#0b0e12" fillOpacity="0.94" />
        <path d="M240 148 V124 H258 M252 117 L259 124 L252 131" stroke="#f5f5f7" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="276" y="128" fill="#f5f5f7" fontSize="16" fontWeight="600">Gira a la derecha</text>
        <text x="276" y="150" fill="#8f959e" fontSize="12.5">Ruta de ejemplo</text>

        {/* reproductor */}
        <rect x="214" y="380" width="292" height="46" rx="23" fill="#0b0e12" fillOpacity="0.94" />
        <rect x="222" y="388" width="30" height="30" rx="8" fill="#2b3140" />
        <path d="M232 410 V396 L244 394 V408" stroke="#b6bbc2" strokeWidth="2" fill="none" />
        <text x="264" y="400" fill="#f5f5f7" fontSize="12.5" fontWeight="600">Reproduciendo</text>
        <rect x="264" y="410" width="200" height="3" rx="1.5" fill="#2f333a" />
        <rect x="264" y="410" width="84" height="3" rx="1.5" fill="#b6bbc2" />

        {/* dock lateral */}
        <rect x="98" y="78" width="92" height="364" fill="#07090c" fillOpacity="0.9" />
        <rect x="118" y="100" width="52" height="52" rx="14" fill="#4f68ee" />
        <path d="M144 112 L156 140 L144 134 L132 140 Z" fill="#fff" />
        <rect x="118" y="166" width="52" height="52" rx="14" fill="#262b33" />
        <path d="M138 206 V182 L156 178 V202" stroke="#d8dbe0" strokeWidth="3" fill="none" />
        <circle cx="134" cy="206" r="5" fill="#d8dbe0" />
        <circle cx="152" cy="202" r="5" fill="#d8dbe0" />
        <rect x="118" y="232" width="52" height="52" rx="14" fill="#262b33" />
        <path d="M134 246 C 134 264, 142 272, 156 272 L 156 264 L 149 262 L 146 266 C 141 263, 139 260, 138 255 L 142 252 L 140 246 Z" fill="#d8dbe0" />
        <rect x="118" y="298" width="52" height="52" rx="14" fill="#262b33" />
        <g fill="#d8dbe0">
          <rect x="132" y="312" width="10" height="10" rx="3" />
          <rect x="146" y="312" width="10" height="10" rx="3" />
          <rect x="132" y="326" width="10" height="10" rx="3" />
          <rect x="146" y="326" width="10" height="10" rx="3" />
        </g>
        <text x="144" y="420" textAnchor="middle" fill="#d8dbe0" fontSize="15" fontWeight="600">12:40</text>

        {/* reflejo del cristal */}
        <path d="M98 78 H430 L250 442 H98 Z" fill="#fff" opacity="0.035" />
      </g>
    </svg>
  )
}

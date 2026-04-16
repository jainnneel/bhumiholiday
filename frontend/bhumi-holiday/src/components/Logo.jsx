/**
 * BrandLogo — premium logo component for Bhumi Holiday.
 *
 * Uses /logo.jpeg from the public folder (transparent background).
 * Falls back to a clean "BH" SVG monogram if the image fails.
 *
 * Props:
 *   transparent  {boolean} — true when over a dark hero (affects wordmark colour)
 *   size         {'sm'|'md'|'lg'}
 *   className    {string}
 *   showText     {boolean} — show "Bhumi Holiday" wordmark beside logo
 */

import { useState } from 'react'

// Public-folder URL — Vite serves /public at the root, no hashing
const PUBLIC_LOGO = '/logo.jpeg'

const SIZE = {
  sm: { img: 'w-9 h-9',   text: 'text-sm',   gap: 'gap-2'   },
  md: { img: 'w-11 h-11', text: 'text-base',  gap: 'gap-2.5' },
  lg: { img: 'w-14 h-14', text: 'text-lg',    gap: 'gap-3'   },
}

/** SVG monogram — shown when the image 404s */
function Monogram({ size }) {
  const s = SIZE[size]
  return (
    <div className={`${s.img} flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-md`}>
      <svg viewBox="0 0 36 36" fill="none" className="w-5/6 h-5/6">
        <text x="2"  y="26" fontFamily="Georgia, serif" fontWeight="bold" fontSize="16" fill="white">B</text>
        <text x="17" y="26" fontFamily="Georgia, serif" fontWeight="bold" fontSize="16" fill="rgba(255,255,255,0.85)">H</text>
        <path d="M6 30 L30 30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function BrandLogo({
  transparent = false,
  size        = 'md',
  className   = '',
  showText    = true,
}) {
  const [imgError, setImgError] = useState(false)
  const s = SIZE[size]

  const wordmarkCol = transparent ? 'text-white'      : 'text-gray-900 dark:text-white'

  return (
    <div className={`flex items-center ${s.gap} group ${className}`}>

      {/* ── Logo image (no background box — transparent PNG/JPEG) ── */}
      {imgError ? (
        <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
          <Monogram size={size} />
        </div>
      ) : (
        <img
          src={PUBLIC_LOGO}
          alt="Bhumi Holiday"
          onError={() => setImgError(true)}
          className={`
            ${s.img} flex-shrink-0 object-contain
            group-hover:scale-105 transition-transform duration-300
            drop-shadow-sm
          `}
        />
      )}

      {/* ── Wordmark ── */}
      {showText && (
        <div className="min-w-0 leading-none">
          <span className={`font-extrabold tracking-tight block truncate ${s.text} ${wordmarkCol}`}>
            Bhumi Holiday
          </span>
        </div>
      )}
    </div>
  )
}

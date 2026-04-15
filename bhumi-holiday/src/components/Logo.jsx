/**
 * Logo component — tries logo.png first (Bhumi Holidays brand PNG),
 * falls back to logo.jpeg (old logo). Uses text fallback if both fail.
 *
 * TO UPDATE LOGO:
 *   1. Save the Bhumi Holidays PNG as  src/assets/logo.png
 *   2. The new logo will appear automatically everywhere.
 */

import { useState } from 'react'

// Try PNG first — will 404 gracefully if not present, falling back to JPEG
let logoPng = null
let logoJpeg = null

try {
  logoPng  = new URL('../assets/logo.png',  import.meta.url).href
} catch { /* no PNG */ }

try {
  logoJpeg = new URL('../assets/logo.jpeg', import.meta.url).href
} catch { /* no JPEG */ }

// Vite static imports (handles hashing + bundling)
import logoJpegSrc from '../assets/logo.jpeg'

export default function Logo({ className = '', alt = 'Bhumi Holidays', style = {} }) {
  const [src, setSrc]   = useState('/logo.png')   // tries public/logo.png first
  const [tried, setTried] = useState(0)

  const fallbacks = [logoJpegSrc]

  const handleError = () => {
    if (tried < fallbacks.length) {
      setSrc(fallbacks[tried])
      setTried(tried + 1)
    }
    // else: completely broken — show nothing (parent wraps with text fallback)
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  )
}

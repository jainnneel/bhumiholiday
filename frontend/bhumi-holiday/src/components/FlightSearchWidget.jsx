/**
 * FlightSearchWidget – mobile-first shared search form
 *   • LandingPage hero  (navigates=true → /search with URL params)
 *   • FlightSearch page (onSearch prop  → inline search)
 *
 * Mobile layout:
 *   FROM  (full-width)
 *    ⇌   (centered swap button)
 *   TO    (full-width)s
 *   DATE  (full-width)
 *   [ADULTS −n+]  [CHILDREN −n+]   (2 equal cols)
 *   coupon row
 *   [Search Flights] (full-width)
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import { flightAPI } from '../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// Airport autocomplete
// ─────────────────────────────────────────────────────────────────────────────
function AirportInput({ label, icon, value, onChange, placeholder, id, compact = false }) {
  const [query,   setQuery]   = useState(value || '')
  const [results, setResults] = useState([])
  const [open,    setOpen]    = useState(false)
  const [busy,    setBusy]    = useState(false)
  const debRef  = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => { if (value !== query) setQuery(value || '') }, [value])

  useEffect(() => {
    const fn = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const doSearch = useCallback((q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return }
    setBusy(true)
    flightAPI.searchAirport(q)
      .then((res) => {
        let data = res.data
        if (typeof data === 'string') { try { data = JSON.parse(data) } catch { data = [] } }
        const arr    = Array.isArray(data) ? data : []
        const mapped = arr
          .map((i) => ({ label: i.v || i.value || i.name || i.k || '', key: i.k || i.key || i.iata || '' }))
          .filter((x) => x.label)
        setResults(mapped)
        setOpen(mapped.length > 0)
      })
      .catch(() => setResults([]))
      .finally(() => setBusy(false))
  }, [])

  const handleInput = (e) => {
    const v = e.target.value
    setQuery(v); onChange('')
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => doSearch(v), 280)
  }

  const handleSelect = (item) => {
    setQuery(item.label); onChange(item.label)
    setOpen(false); setResults([])
  }

  return (
    <div className="relative w-full" ref={wrapRef}>
      {!compact && label && (
        <label htmlFor={id} className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 group-focus-within:text-brand-600 transition-colors pointer-events-none z-10">
          <i className={`fas ${icon} text-sm`} />
        </span>
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 2 && doSearch(query)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600
                     bg-gray-50 dark:bg-gray-700/60 text-sm font-medium
                     text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:outline-none focus:border-brand-400 dark:focus:border-brand-500
                     focus:bg-white dark:focus:bg-gray-700
                     focus:ring-4 focus:ring-brand-500/10
                     hover:border-gray-300 dark:hover:border-gray-500
                     transition-all duration-200 truncate"
        />
        {busy && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <i className="fas fa-circle-notch fa-spin text-gray-300 text-xs" />
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1,  y:  0 }}
            exit={{    opacity: 0,  y: -6 }}
            transition={{ duration: 0.13 }}
            className="absolute z-[200] w-full mt-1.5 bg-white dark:bg-gray-800 rounded-2xl
                       shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <ul className="max-h-52 overflow-y-auto scrollbar-hide py-1.5">
              {results.map((item, i) => (
                <li key={i} onClick={() => handleSelect(item)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer
                             hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                  <div className="w-7 h-7 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-map-marker-alt text-brand-500 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Passenger stepper — mobile-friendly tap targets
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({ label, sublabel, value, onChange, min = 0, max = 9 }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="flex items-center bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600
                      rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex-shrink-0 w-11 h-12 flex items-center justify-center text-xl font-light
                     text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600
                     active:bg-gray-300 dark:active:bg-gray-500
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Decrease ${label}`}
        >−</button>
        <div className="flex-1 text-center">
          <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{value}</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">{sublabel(value)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex-shrink-0 w-11 h-12 flex items-center justify-center text-xl font-light
                     text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600
                     active:bg-gray-300 dark:active:bg-gray-500
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main widget
// ─────────────────────────────────────────────────────────────────────────────
export default function FlightSearchWidget({
  onSearch,
  navigates = false,
  compact   = false,
  initial   = {},
  loading   = false,
}) {
  const { user, coupon, couponApplied, setCouponApplied } = useAuth()
  const navigate = useNavigate()

  const [from,       setFrom]       = useState(initial.from     || 'Ahmedabad, IN - Sardar Vallabh Bhai Patel (AMD)')
  const [to,         setTo]         = useState(initial.to       || 'Mumbai, IN - Chatrapati Shivaji Airport (BOM)')
  const [date,       setDate]       = useState(initial.date     || '')
  const [adults,     setAdults]     = useState(initial.adults   || 1)
  const [children,   setChildren]   = useState(initial.children || 0)
  const [couponCode, setCouponCode] = useState('')
  const [couponMode, setCouponMode] = useState('idle') // 'idle' | 'editing'
  const couponInputRef = useRef(null)

  const today       = new Date().toISOString().split('T')[0]
  const contextCode = coupon ? (coupon.coupenCode || coupon.code || '') : ''

  // Sync from auth context
  useEffect(() => {
    if (coupon && couponApplied && contextCode) {
      setCouponCode(contextCode)
      setCouponMode('idle')
    } else if (!coupon) {
      setCouponCode('')
      setCouponMode('idle')
    }
  }, [coupon, couponApplied])

  useEffect(() => {
    if (couponMode === 'editing') couponInputRef.current?.focus()
  }, [couponMode])

  const handleSwap = () => { setFrom(to); setTo(from) }

  const handleRemoveCoupon = () => {
    setCouponApplied(false); setCouponCode(''); setCouponMode('idle')
  }

  const handleApplyCoupon = () => {
    if (couponCode.trim()) { setCouponApplied(true); setCouponMode('idle') }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!from.trim() || !to.trim() || !date) return
    const effectiveCoupon = couponApplied && couponCode.trim() ? couponCode.trim() : null
    if (navigates) {
      const q = new URLSearchParams({
        from, to, date,
        adults: String(adults), children: String(children),
        ...(effectiveCoupon ? { coupon: effectiveCoupon } : {}),
      })
      navigate(`/search?${q.toString()}`)
    } else if (onSearch) {
      onSearch({ from, to, date, adults, children, coupon: effectiveCoupon })
    }
  }

  const isApplied  = couponApplied && !!couponCode && couponMode === 'idle'
  const hasContext = !!contextCode

  // ── Compact sticky bar ───────────────────────────────────────────────────
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 p-3">
        <div className="flex-1 min-w-[120px]">
          <AirportInput id="from-c" icon="fa-plane-departure" value={from} onChange={setFrom} placeholder="From" compact />
        </div>
        <button type="button" onClick={handleSwap}
          className="w-8 h-10 flex items-center justify-center text-brand-400 hover:text-brand-600 transition-colors flex-shrink-0">
          <i className="fas fa-exchange-alt text-sm" />
        </button>
        <div className="flex-1 min-w-[120px]">
          <AirportInput id="to-c" icon="fa-plane-arrival" value={to} onChange={setTo} placeholder="To" compact />
        </div>
        <div className="min-w-[110px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
              <i className="far fa-calendar-alt" />
            </span>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required
              className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700/60 text-xs text-gray-900 dark:text-white
                         focus:outline-none focus:border-brand-400 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-2 h-10 flex-shrink-0">
          <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
            className="w-6 h-6 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-base flex items-center justify-center">−</button>
          <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white tabular-nums">{adults}</span>
          <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))}
            className="w-6 h-6 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-base flex items-center justify-center">+</button>
          <span className="text-[10px] text-gray-400 ml-1 whitespace-nowrap">pax</span>
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap flex-shrink-0">
          {loading ? <i className="fas fa-circle-notch fa-spin" /> : <><i className="fas fa-search mr-1" />Search</>}
        </button>
      </form>
    )
  }

  // ── Full layout (mobile-first) ────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* ── FROM / SWAP / TO
            Mobile:  full-width stack with centered swap button
            Desktop: single horizontal row
      ── */}
      <div>
        {/* Desktop row */}
        <div className="hidden md:grid md:grid-cols-[1fr_40px_1fr] md:items-end md:gap-2">
          <AirportInput id="from-f-d" label="From" icon="fa-plane-departure" value={from} onChange={setFrom} placeholder="City or airport" />
          <div className="flex items-center justify-center mb-0.5">
            <button type="button" onClick={handleSwap}
              className="w-10 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                         rounded-full shadow-sm flex items-center justify-center text-brand-500
                         hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300
                         hover:rotate-180 hover:shadow-md transition-all duration-300">
              <i className="fas fa-exchange-alt text-sm" />
            </button>
          </div>
          <AirportInput id="to-f-d" label="To" icon="fa-plane-arrival" value={to} onChange={setTo} placeholder="City or airport" />
        </div>

        {/* Mobile stack */}
        <div className="md:hidden space-y-2">
          <AirportInput id="from-f-m" label="From" icon="fa-plane-departure" value={from} onChange={setFrom} placeholder="Departure city or airport" />
          {/* Centered swap divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
            <button
              type="button"
              onClick={handleSwap}
              className="w-9 h-9 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                         rounded-full shadow-sm flex items-center justify-center text-brand-500
                         hover:bg-brand-50 hover:border-brand-300 hover:shadow-md
                         active:scale-95 transition-all duration-200 flex-shrink-0"
            >
              <i className="fas fa-exchange-alt text-sm" />
            </button>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>
          <AirportInput id="to-f-m" label="To" icon="fa-plane-arrival" value={to} onChange={setTo} placeholder="Destination city or airport" />
        </div>
      </div>

      {/* ── DATE / ADULTS / CHILDREN
            Mobile:  DATE full-width, then ADULTS + CHILDREN side-by-side (2 cols)
            Desktop: 3 equal columns
      ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Date — spans full width on mobile */}
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="travel-date" className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
            Travel Date
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none text-sm">
              <i className="far fa-calendar-alt" />
            </span>
            <input
              id="travel-date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700/60 text-sm font-medium
                         text-gray-900 dark:text-white
                         focus:outline-none focus:border-brand-400 dark:focus:border-brand-500
                         focus:bg-white dark:focus:bg-gray-700
                         focus:ring-4 focus:ring-brand-500/10
                         hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            />
          </div>
        </div>

        {/* Adults */}
        <Stepper
          label="Adults" min={1} max={9}
          value={adults} onChange={setAdults}
          sublabel={(n) => n === 1 ? '1 Adult' : `${n} Adults`}
        />

        {/* Children */}
        <Stepper
          label="Children" min={0} max={9}
          value={children} onChange={setChildren}
          sublabel={(n) => n === 0 ? 'None' : n === 1 ? '1 Child' : `${n} Children`}
        />
      </div>

      {/* ── Coupon section ── */}
      <div>
        {isApplied ? (
          /* ─ Applied pill ─ */
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1,  y:  0 }}
            className="flex items-center bg-emerald-50 dark:bg-emerald-900/20
                       border border-emerald-200 dark:border-emerald-700/60
                       rounded-xl px-3.5 py-2.5 gap-2 min-w-0"
          >
            {/* Tick */}
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-check text-white text-[9px]" />
            </div>

            {/* Text — flex-1 + min-w-0 prevents overflow */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex-shrink-0">Coupon</span>
              <span className="font-mono text-xs font-bold bg-emerald-200/70 dark:bg-emerald-900/50
                               text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-md
                               tracking-wide truncate max-w-[120px]">
                {couponCode.toUpperCase()}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex-shrink-0 hidden sm:inline">applied</span>
            </div>

            {/* Actions — always on same line, never wrap */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => { setCouponMode('editing'); setCouponApplied(false) }}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900
                           font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-200/50
                           transition-all whitespace-nowrap"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-red-500 hover:text-red-700 font-semibold
                           px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                           transition-all whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          </motion.div>

        ) : couponMode === 'editing' ? (
          /* ─ Input row ─ */
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1,  y:  0 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none">
                <i className="fas fa-tag text-sm" />
              </span>
              <input
                ref={couponInputRef}
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon() } }}
                placeholder="Coupon code"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-300 dark:border-brand-600
                           bg-white dark:bg-gray-700 text-sm font-mono font-semibold tracking-wider
                           text-gray-900 dark:text-white placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400
                           focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                           transition-all uppercase"
              />
            </div>
            <button type="button" onClick={handleApplyCoupon}
              className="flex-shrink-0 px-4 py-3 bg-brand-600 hover:bg-brand-700
                         text-white text-sm font-bold rounded-xl transition-all
                         hover:shadow-lg hover:shadow-brand-500/25 active:scale-95">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setCouponMode('idle')
                setCouponCode(contextCode)
                if (contextCode) setCouponApplied(true)
              }}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center
                         text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <i className="fas fa-times" />
            </button>
          </motion.div>

        ) : (
          /* ─ Idle link ─ */
          <button
            type="button"
            onClick={() => setCouponMode('editing')}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400
                       hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
          >
            <div className="w-6 h-6 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors flex-shrink-0">
              <i className="fas fa-tag text-brand-500 text-xs" />
            </div>
            {hasContext && !couponApplied
              ? <span>Apply coupon <span className="font-mono text-xs bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded">{contextCode.toUpperCase()}</span></span>
              : <span>Have a coupon code?</span>}
          </button>
        )}
      </div>

      {/* ── Search CTA — full width on all screen sizes ── */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500
                     hover:from-brand-700 hover:to-brand-600
                     text-white font-bold text-base rounded-2xl
                     shadow-lg shadow-brand-500/25
                     hover:shadow-xl hover:shadow-brand-500/30
                     hover:-translate-y-0.5 active:translate-y-0 active:shadow-md
                     flex items-center justify-center gap-2.5
                     transition-all duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading
            ? <><i className="fas fa-circle-notch fa-spin" />Searching...</>
            : <><i className="fas fa-search text-sm" />Search Flights</>}
        </button>
      </div>
    </form>
  )
}

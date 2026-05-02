import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CouponCard from '../components/CouponCard'
import FlightSearchWidget from '../components/FlightSearchWidget'
import SkeletonCard from '../components/SkeletonCard'
import { flightAPI } from '../services/api'
import { normaliseFlights, applyFlightFilters } from '../utils/flightUtils'
import { buildWhatsAppMessage, openWhatsApp } from '../utils/whatsappMessage'
import { waLink, WA_MSG_INTERNATIONAL } from '../utils/constants'
import TicketModal from '../components/TicketModal'

// ── Booking / WhatsApp modal ─────────────────────────────────────────────────
function BookingModal({ flight, couponCode, user, onClose }) {
  const adults   = parseInt(flight.adult)    || 0
  const children = parseInt(flight.child)    || 0
  const infants  = parseInt(flight.infrants) || 0
  const total    = adults + children + infants

  const [passengers, setPassengers] = useState(() =>
    Array.from({ length: total }, () => ({ first: '', last: '' }))
  )
  const [email,  setEmail]  = useState(user?.email || '')
  const [mobile, setMobile] = useState(user?.phone || '')
  const [error,  setError]  = useState('')

  const updatePax = (i, field, val) => {
    const u = [...passengers]; u[i] = { ...u[i], [field]: val }; setPassengers(u)
  }

  const buildLabel = (idx) => {
    if (idx < adults)            return `Adult ${idx + 1}`
    if (idx < adults + children) return `Child ${idx - adults + 1}`
    return `Infant ${idx - adults - children + 1}`
  }

  const validate = () => {
    if (!email.trim() || !mobile.trim()) { setError('Please fill email and mobile'); return false }
    if (mobile.replace(/\D/g, '').length < 10) { setError('Enter a valid 10-digit mobile number'); return false }
    for (let i = 0; i < total; i++) {
      if (!passengers[i]?.first.trim() || !passengers[i]?.last.trim()) {
        setError('Please fill all passenger names'); return false
      }
    }
    setError(''); return true
  }

  const billingFields = {
    company: user?.company || '',
    pan:     user?.pan     || '',
    gst:     user?.gst     || '',
    address: user?.address || '',
  }

  const handleSubmit = () => {
    if (!validate()) return
    const msg = buildWhatsAppMessage({ flight, passengers, email, mobile, coupon: couponCode, ...billingFields })
    onClose()
    openWhatsApp(msg)
  }

  const handleCopy = () => {
    if (!validate()) return
    const msg = buildWhatsAppMessage({ flight, passengers, email, mobile, coupon: couponCode, ...billingFields })
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(() => toast.success('Message copied to clipboard!'))
    } else {
      const el = document.createElement('textarea')
      el.value = msg
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
      toast.success('Message copied!')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fab fa-whatsapp text-[#25d366] text-xl" />Send Flight Inquiry
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{flight.flightName} · {flight.fromc} → {flight.toc} · {flight.date}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i className="fas fa-times text-lg" />
            </button>
          </div>

          {/* Flight summary strip */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold">
              <i className="fas fa-plane-departure text-xs" />{flight.fromTime}
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <i className="fas fa-plane-arrival text-xs" />{flight.toTime}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 dark:text-gray-400"><i className="fas fa-clock mr-1 text-xs" />{flight.duration}</span>
          </div>

          {/* Passengers */}
          <div className="space-y-3 mb-4">
            {Array.from({ length: total }, (_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-3">
                  <i className="fas fa-user mr-1" />{buildLabel(i)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['First Name', 'Last Name'].map((lbl, j) => (
                    <div key={j}>
                      <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                      <input type="text"
                        value={passengers[i]?.[j === 0 ? 'first' : 'last'] || ''}
                        onChange={(e) => updatePax(i, j === 0 ? 'first' : 'last', e.target.value)}
                        placeholder={lbl}
                        className="input-premium text-sm py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide mb-3">
              <i className="fas fa-address-book mr-1" />Contact Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-premium text-sm py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mobile</label>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 89803 45600"
                  className="input-premium text-sm py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3 flex items-center gap-1.5"><i className="fas fa-exclamation-circle" />{error}</p>}

          <div className="flex gap-2 flex-wrap">
            <button onClick={onClose} className="btn-secondary flex-1 py-3 text-sm min-w-[80px]">Cancel</button>
            <button onClick={handleCopy} className="btn-secondary flex-shrink-0 py-3 px-4 text-sm">
              <i className="far fa-copy text-sm" />Copy
            </button>
            <button onClick={handleSubmit} className="btn-whatsapp flex-1 py-3 min-w-[150px]">
              <i className="fab fa-whatsapp text-lg" />Send on WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Flight Card ───────────────────────────────────────────────────────────────
function FlightCard({ flight, onInquiry, onTicket, isBestDeal = false, isLoggedIn = false }) {
  const savings = flight.hasPersonDiscount
    ? Math.round(parseFloat(flight.perPerson) - parseFloat(flight.dicPerPerson))
    : 0

  const stopsColor =
    flight.stops === 0 ? 'text-emerald-500' :
    flight.stops === 1 ? 'text-amber-500'   : 'text-red-500'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flight-card relative ${isBestDeal ? 'ring-2 ring-brand-400 dark:ring-brand-500' : ''}`}
    >
      {/* Best Deal ribbon */}
      {isBestDeal && (
        <div className="absolute -top-px -right-px z-10">
          <div className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1">
            <i className="fas fa-star text-yellow-300 text-xs" />Best Deal
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 sm:px-5 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{flight.airlineInfo}</span>
        <span className="text-xs text-gray-400">
          <i className="far fa-calendar-alt mr-1" />{flight.formattedDate}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {/* Route row */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4">
          <div className="text-center min-w-[52px] sm:min-w-[60px]">
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{flight.fromTime}</p>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{flight.fromc}</p>
          </div>

          <div className="flex-1 flex flex-col items-center px-1">
            <p className="text-xs font-semibold text-gray-400 mb-1">{flight.duration}</p>
            <div className="w-full flex items-center">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <i className="fas fa-plane text-brand-400 text-xs mx-1.5 sm:mx-2" />
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>
            <p className={`text-xs font-semibold mt-1 ${stopsColor}`}>
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="text-center min-w-[52px] sm:min-w-[60px]">
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">{flight.toTime}</p>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{flight.toc}</p>
          </div>
        </div>

        {/* Price + Actions row */}
        <div className="flex items-start justify-between gap-3">
          {/* Price */}
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              ₹{Number(flight.dicPerPerson).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">per person</p>
            {flight.hasPersonDiscount && (
              <p className="text-xs text-gray-400 line-through mt-0.5">₹{Number(flight.perPerson).toLocaleString()}</p>
            )}
            {savings > 0 && (
              <span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                Save ₹{savings.toLocaleString()}
              </span>
            )}
            <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
              Total ₹{Number(flight.dicPrice).toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 flex-shrink-0 min-w-[108px] sm:min-w-[130px]">
            <button onClick={() => onInquiry(flight)} className="btn-whatsapp w-full justify-center text-sm py-2">
              <i className="fab fa-whatsapp text-base" />Inquiry
            </button>
            {isLoggedIn && (
              <button onClick={() => onTicket(flight)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 font-semibold text-sm py-2 rounded-xl border-2 border-brand-200 dark:border-brand-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200">
                <i className="fas fa-ticket-alt text-xs" />Get Ticket
              </button>
            )}
            {flight.seatLeft && parseInt(flight.seatLeft) > 0 && parseInt(flight.seatLeft) <= 9 && (
              <p className="text-xs text-amber-500 font-medium text-center">
                <i className="fas fa-exclamation-triangle mr-1" />{flight.seatLeft} seats left
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FlightSearch({ darkMode, setDarkMode }) {
  const { coupon, couponApplied, setCouponApplied, user } = useAuth()
  const [searchParams]      = useSearchParams()

  const [loading,     setLoading]     = useState(false)
  const [allFlights,  setAllFlights]  = useState([])
  const [filtered,    setFiltered]    = useState([])
  const [searched,    setSearched]    = useState(false)
  const [lastSearch,  setLastSearch]  = useState(null) // {from, to, date, adults, children, coupon}
  const [modalFlight,  setModalFlight]  = useState(null)
  const [ticketFlight, setTicketFlight] = useState(null)
  const [stickySearch, setStickySearch] = useState(false)

  // Filters
  const [filterAirline, setFilterAirline] = useState('')
  const [filterSearch,  setFilterSearch]  = useState('')
  const [filterStops,   setFilterStops]   = useState('All')
  const [filterMin,     setFilterMin]     = useState('')
  const [filterMax,     setFilterMax]     = useState('')

  const resultsRef = useRef(null)
  const stickyRef  = useRef(null)

  // Auto-search from URL params (coming from landing page)
  useEffect(() => {
    const from     = searchParams.get('from')
    const to       = searchParams.get('to')
    const date     = searchParams.get('date')
    const adults   = parseInt(searchParams.get('adults')   || '1')
    const children = parseInt(searchParams.get('children') || '0')
    const couponParam = searchParams.get('coupon') || ''

    if (from && to && date) {
      const cp = couponParam || (couponApplied && coupon ? (coupon.coupenCode || coupon.code) : null)
      doSearch({ from, to, date, adults, children, coupon: cp })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sticky search bar on scroll
  useEffect(() => {
    const fn = () => setStickySearch(window.scrollY > 350)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Re-filter when data or filter values change
  useEffect(() => {
    if (!allFlights.length) return
    const result = applyFlightFilters(allFlights, {
      airline:  filterAirline,
      search:   filterSearch,
      stops:    filterStops,
      minPrice: filterMin ? parseInt(filterMin) : 0,
      maxPrice: filterMax ? parseInt(filterMax) : undefined,
    })
    setFiltered(result)
  }, [allFlights, filterAirline, filterSearch, filterStops, filterMin, filterMax])

  const doSearch = useCallback(async (params) => {
    const { from, to, date, adults, children, coupon: cp } = params
    if (!from || !to || !date) return

    setLoading(true)
    setAllFlights([])
    setFiltered([])
    setSearched(true)
    setLastSearch(params)
    // Reset filters
    setFilterAirline(''); setFilterSearch(''); setFilterStops('All'); setFilterMin(''); setFilterMax('')

    try {
      const res  = await flightAPI.search(from, to, date, adults, children, 0, cp || null)
      const data = Array.isArray(res.data) ? res.data : []

      if (data.length === 0) {
        toast.error('No flights found for this route and date')
        setLoading(false)
        return
      }

      data.sort((a, b) => parseFloat(a.perPerson) - parseFloat(b.perPerson))
      const normalised = normaliseFlights(data, from, to, adults, children)
      setAllFlights(normalised)
      setFiltered(normalised)
      setLoading(false)

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    } catch (err) {
      setLoading(false)
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch flights'
      toast.error(msg)
    }
  }, [])

  const clearFilters = () => {
    setFilterAirline(''); setFilterSearch(''); setFilterStops('All'); setFilterMin(''); setFilterMax('')
  }

  const activeFilterCount = [filterAirline, filterSearch, filterStops !== 'All' ? 'x' : '', filterMin, filterMax].filter(Boolean).length

  const initialParams = {
    from:     searchParams.get('from')     || '',
    to:       searchParams.get('to')       || '',
    date:     searchParams.get('date')     || '',
    adults:   parseInt(searchParams.get('adults')   || '1'),
    children: parseInt(searchParams.get('children') || '0'),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* ── Sticky search bar (appears after scroll) ── */}
      <AnimatePresence>
        {stickySearch && searched && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            ref={stickyRef}
            className="fixed top-16 left-0 right-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="max-w-7xl mx-auto">
              <FlightSearchWidget
                compact
                onSearch={doSearch}
                loading={loading}
                initial={lastSearch || initialParams}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="bg-hero pt-16 sm:pt-20 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Search Domestic Flights</h1>
            <p className="text-white/65 mt-1 text-xs sm:text-sm">Lowest fares · Live prices · No account required</p>
            {/* International inquiry pill */}
            <a
              href={waLink(WA_MSG_INTERNATIONAL)}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
            >
              <i className="fab fa-whatsapp text-[#25d366] text-sm" />
              Looking for International Flights? Inquire on WhatsApp →
            </a>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">

        {/* ── Main search form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8 -mt-6 sm:-mt-8 mb-4 sm:mb-6"
        >
          {/* Guest coupon nudge */}
          {!user && (
            <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3.5 py-2.5 mb-4">
              <i className="fas fa-gift text-amber-500 flex-shrink-0 text-sm" />
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 flex-1 min-w-0">
                <strong>Get an extra Up to 5% off</strong><span className="hidden sm:inline"> — sign up free to unlock your exclusive coupon</span>
              </p>
              <Link to="/signup"
                className="flex-shrink-0 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                Get Coupon
              </Link>
            </div>
          )}

          {/* Coupon widget for logged-in users */}
          {user && coupon && (
            <div className="mb-5">
              <CouponCard compact />
            </div>
          )}

          <FlightSearchWidget onSearch={doSearch} loading={loading} initial={initialParams} />
        </motion.div>

        {/* ── Skeleton loading ── */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-5 w-40 rounded-full shimmer dark:bg-gray-700" />
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        {!loading && searched && allFlights.length > 0 && (
          <motion.div ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Filters bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-5 mb-4 sm:mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <i className="fas fa-sliders-h text-brand-500" />Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Airline */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Airline</label>
                  <div className="relative">
                    <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" value={filterAirline}
                      onChange={(e) => setFilterAirline(e.target.value.toUpperCase())}
                      placeholder="e.g. IndiGo"
                      className="input-premium pl-8 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Search</label>
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Search anything"
                      className="input-premium pl-8 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>

                {/* Stops */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Stops</label>
                  <select value={filterStops} onChange={(e) => setFilterStops(e.target.value)}
                    className="input-premium py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="All">All Stops</option>
                    <option value="0">Non-stop</option>
                    <option value="1">1 Stop</option>
                    <option value="2">2 Stops</option>
                    <option value="3">3+ Stops</option>
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Price/Person (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" value={filterMin}
                      onChange={(e) => setFilterMin(e.target.value)}
                      placeholder="Min"
                      className="input-premium py-2 text-sm w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <input type="number" value={filterMax}
                      onChange={(e) => setFilterMax(e.target.value)}
                      placeholder="Max"
                      className="input-premium py-2 text-sm w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {filtered.length} Flight{filtered.length !== 1 ? 's' : ''} Found
                </h2>
                {lastSearch?.from && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lastSearch.from.split('(')[0]?.trim()} → {lastSearch.to.split('(')[0]?.trim()} · {lastSearch.date}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {lastSearch?.coupon && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <i className="fas fa-tag" />Coupon: {lastSearch.coupon}
                  </span>
                )}
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                  Sorted by price
                </span>
              </div>
            </div>

            {/* Flight cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-plane text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold mb-1">No flights match your filters</p>
                <p className="text-sm text-gray-400 mb-4">Try adjusting your filter criteria.</p>
                <button onClick={clearFilters} className="btn-primary px-6 py-2.5 text-sm">
                  <i className="fas fa-times mr-1.5" />Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.map((flight, idx) => (
                    <FlightCard
                      key={`${flight.rowId}-${flight.fromTime}`}
                      flight={flight}
                      onInquiry={setModalFlight}
                      onTicket={setTicketFlight}
                      isBestDeal={idx === 0}
                      isLoggedIn={!!user}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
              <i className="fas fa-info-circle mr-2" />
              <strong>Note:</strong> Airline fares are dynamic. Prices are valid as of search time and may change at issuance. Separate PNRs per person at quoted fare; contact us for a single PNR.
            </div>
          </motion.div>
        )}

        {/* Empty state after search */}
        {!loading && searched && allFlights.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-plane-slash text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Flights Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
              No flights available for this route and date. Try a different date or route.
            </p>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {modalFlight && (
          <BookingModal
            flight={modalFlight}
            couponCode={lastSearch?.coupon || ''}
            user={user}
            onClose={() => setModalFlight(null)}
          />
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      <AnimatePresence>
        {ticketFlight && (
          <TicketModal
            flight={ticketFlight}
            lastSearch={lastSearch}
            userEmail={user?.email || ''}
            userName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''}
            onClose={() => setTicketFlight(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

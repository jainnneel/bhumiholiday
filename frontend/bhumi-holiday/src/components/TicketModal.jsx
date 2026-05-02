import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ticketAPI } from '../services/api'

function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </label>
  )
}

export default function TicketModal({ flight, lastSearch, userEmail, userName, onClose }) {
  const adults   = parseInt(flight.adult)    || 0
  const children = parseInt(flight.child)    || 0
  const infants  = parseInt(flight.infrants) || 0
  const totalPassengers = Math.max(1, adults + children + infants)

  const discountPerPerson = flight.hasPersonDiscount
    ? Math.max(0, parseFloat(flight.perPerson) - parseFloat(flight.dicPerPerson))
    : 0

  const [passengerNames,         setPassengerNames]         = useState(() => {
    const names = Array(totalPassengers).fill('')
    if (userName) names[0] = userName
    return names
  })
  const [email,                  setEmail]                  = useState(userEmail || '')
  const [pnr,                    setPnr]                    = useState('')
  const [pricePerPerson,         setPricePerPerson]         = useState(String(Math.round(parseFloat(flight.dicPerPerson) || 0)))
  const [includeCompanyDetails,  setIncludeCompanyDetails]  = useState(true)
  const [showPricingInformation, setShowPricingInformation] = useState(true)
  const [discountAmount,         setDiscountAmount]         = useState(discountPerPerson.toFixed(2))
  const [loadingDownload,        setLoadingDownload]        = useState(false)
  const [loadingEmail,           setLoadingEmail]           = useState(false)

  const paxLabel = (idx) => {
    if (idx < adults)            return `Adult ${idx + 1}`
    if (idx < adults + children) return `Child ${idx - adults + 1}`
    return `Infant ${idx - adults - children + 1}`
  }

  const updateName = (idx, val) =>
    setPassengerNames(prev => prev.map((n, i) => i === idx ? val : n))

  const buildDto = () => ({
    flightName:            flight.flightName,
    flightLabel:           flight.airlineInfo,
    route:                 `${flight.fromc} \u2192 ${flight.toc}`,
    date:                  flight.formattedDate || flight.date,
    time:                  flight.fromTime,
    arrivalTime:           flight.toTime || '',
    duration:              flight.duration,
    fromCity:              flight.from  || '',
    toCity:                flight.to    || '',
    fromIata:              flight.fromc || '',
    toIata:                flight.toc   || '',
    pricePerPerson:        parseFloat(pricePerPerson) || 0,
    passengerNames:        passengerNames.map(n => n.trim()),
    adults,
    children,
    infants,
    email:                 email.trim(),
    pnr:                   pnr.trim().toUpperCase(),
    includeCompanyDetails,
    showPricingInformation,
    discountAmount:        parseFloat(discountAmount) || 0,
    totalPassengers,
    logoUrl:               window.location.origin + '/logo.jpeg',
  })

  const validate = () => {
    if (!pnr.trim()) { toast.error('PNR number is required'); return false }
    if (!email.trim()) { toast.error('Please enter recipient email'); return false }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email.trim())) { toast.error('Please enter a valid email address'); return false }
    return true
  }

  const handleDownload = async () => {
    if (!validate()) return
    setLoadingDownload(true)
    try {
      const res = await ticketAPI.downloadTicket(buildDto())
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `E-Ticket_${flight.fromc}-${flight.toc}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Ticket downloaded successfully!')
      onClose()
    } catch {
      toast.error('Failed to download ticket. Please try again.')
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleEmail = async () => {
    if (!validate()) return
    setLoadingEmail(true)
    try {
      await ticketAPI.emailTicket(buildDto())
      toast.success(`Ticket emailed to ${email.trim()}`)
      onClose()
    } catch {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setLoadingEmail(false)
    }
  }

  const isbusy = loadingDownload || loadingEmail

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isbusy) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-ticket-alt text-brand-500" />
              Download Ticket
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {flight.flightName} · {flight.fromc} → {flight.toc} · {flight.formattedDate || flight.date}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isbusy}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"
          >
            <i className="fas fa-times text-lg" />
          </button>
        </div>

        {/* Flight summary strip */}
        <div className="mx-6 mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold">
            <i className="fas fa-plane-departure text-xs" />{flight.fromTime}
          </span>
          <span className="text-gray-300">→</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <i className="fas fa-plane-arrival text-xs" />{flight.toTime}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 dark:text-gray-400">
            <i className="fas fa-clock mr-1 text-xs" />{flight.duration}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            <i className="fas fa-users mr-1 text-xs" />{totalPassengers} pax
          </span>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Passenger Names */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Passenger Names
            </label>
            {passengerNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">
                  {paxLabel(idx)}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  placeholder={`e.g. Rahul Sharma`}
                  className="input-premium flex-1 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ticket@example.com"
              className="input-premium w-full py-2.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* PNR */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              PNR Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={12}
              className="input-premium w-full py-2.5 text-sm font-mono font-bold tracking-wider uppercase dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Price per Person */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Price per Person <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                type="number"
                min="0"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                placeholder="0"
                className="input-premium w-full pl-7 py-2.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Discount Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Discount Amount (per person)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0"
                className="input-premium w-full pl-7 py-2.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
            <Toggle
              id="company"
              label="Include Company Details"
              checked={includeCompanyDetails}
              onChange={setIncludeCompanyDetails}
            />
            <div className="h-px bg-gray-200 dark:bg-gray-600" />
            <Toggle
              id="pricing"
              label="Show Pricing Information"
              checked={showPricingInformation}
              onChange={setShowPricingInformation}
            />
          </div>

          {/* Price preview */}
          {showPricingInformation && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Price per person</span>
                <span>₹{Number(parseFloat(pricePerPerson) || 0).toLocaleString()}</span>
              </div>
              {parseFloat(discountAmount) > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-gray-500 text-xs mt-1">
                  <span>Discount applied</span>
                  <span>− ₹{Number(discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400 mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-700">
                <span>Total ({totalPassengers} pax)</span>
                <span>
                  ₹{(((parseFloat(pricePerPerson) || 0) - (parseFloat(discountAmount) || 0)) * totalPassengers).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>{/* end scrollable form */}

        {/* Actions — fixed outside scroll */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleDownload}
            disabled={isbusy}
            className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingDownload
              ? <><i className="fas fa-circle-notch fa-spin" />Generating…</>
              : <><i className="fas fa-download" />Download</>
            }
          </button>
          <button
            onClick={handleEmail}
            disabled={isbusy}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingEmail
              ? <><i className="fas fa-circle-notch fa-spin" />Sending…</>
              : <><i className="fas fa-envelope" />Email Ticket</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}

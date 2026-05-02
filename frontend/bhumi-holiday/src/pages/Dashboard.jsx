import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CouponCard from '../components/CouponCard'
import { ticketAPI } from '../services/api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

function TicketRow({ ticket, onDownload, downloading }) {
  const date = ticket.ticketGeneratedAt
    ? new Date(ticket.ticketGeneratedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—'

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-ticket-alt text-brand-500 text-sm" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {ticket.route || 'Flight Ticket'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            <span className="font-semibold text-brand-500">{ticket.pnr}</span>
            &nbsp;·&nbsp;{ticket.flightName}
            &nbsp;·&nbsp;{date}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDownload(ticket.id, ticket.pnr)}
        disabled={downloading === ticket.id}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-300 dark:border-brand-600 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading === ticket.id
          ? <i className="fas fa-circle-notch fa-spin" />
          : <i className="fas fa-download" />
        }
        {downloading === ticket.id ? 'Downloading…' : 'Download'}
      </button>
    </div>
  )
}

export default function Dashboard({ darkMode, setDarkMode }) {
  const { user, coupon, couponApplied } = useAuth()
  const navigate = useNavigate()

  const [tickets,     setTickets]     = useState([])
  const [ticketsLoad, setTicketsLoad] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Traveller'

  useEffect(() => {
    if (!user?.email) return
    setTicketsLoad(true)
    ticketAPI.getUserTickets(user.email)
      .then((res) => setTickets(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setTicketsLoad(false))
  }, [user?.email])

  const handleDownload = async (id, pnr) => {
    setDownloading(id)
    try {
      const res = await ticketAPI.downloadById(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `E-Ticket_${pnr}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Ticket downloaded!')
    } catch {
      toast.error('Failed to download ticket.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Hero */}
      <div className="bg-hero pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Hi, {firstName} 👋
            </h1>
            <p className="text-white/70 text-lg">
              Your exclusive deals are waiting. Ready to fly?
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Coupon + My Tickets */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2 space-y-6">

            {/* Coupon */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Coupon</h2>
                {couponApplied && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                    <i className="fas fa-check-circle" />Applied by default
                  </span>
                )}
              </div>
              {coupon ? (
                <CouponCard />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-ticket-alt text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No coupon available</p>
                  <p className="text-gray-400 text-xs mt-1">Contact support to get an exclusive deal</p>
                </div>
              )}
            </div>

            {/* Quick search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Ready to fly?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Search domestic flights with your coupon auto-applied.
              </p>
              <button
                onClick={() => navigate('/search')}
                className="btn-primary w-full py-3.5 text-base"
              >
                <i className="fas fa-search mr-2" />Search Flights
              </button>
            </div>

            {/* My Tickets */}
            <motion.div {...fadeUp(0.35)}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-ticket-alt text-brand-500" />My Tickets
                </h2>
                {tickets.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                {ticketsLoad ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="w-9 h-9 rounded-xl shimmer dark:bg-gray-700 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-48 rounded shimmer dark:bg-gray-700" />
                          <div className="h-3 w-32 rounded shimmer dark:bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-ticket-alt text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No tickets yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Search a flight and click "Get Ticket" to generate your e-ticket.
                    </p>
                    <button
                      onClick={() => navigate('/search')}
                      className="mt-4 btn-primary px-5 py-2 text-sm"
                    >
                      <i className="fas fa-search mr-1.5" />Search Flights
                    </button>
                  </div>
                ) : (
                  <div>
                    {tickets.map((ticket) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        onDownload={handleDownload}
                        downloading={downloading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Profile + info */}
          <motion.div {...fadeUp(0.3)} className="space-y-4">
            {/* Profile card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow flex-shrink-0">
                  {firstName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {user?.phone && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-phone w-4 text-brand-400" />
                    {user.phone}
                  </div>
                )}
                {user?.company && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-building w-4 text-brand-400" />
                    {user.company}
                  </div>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-gradient-to-br from-brand-600 to-sky-500 rounded-2xl p-5 text-white">
              <i className="fas fa-info-circle text-white/70 mb-3 block" />
              <h4 className="font-bold mb-2">Note</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Separate PNRs per person will be issued at the quoted fare. Contact us for a single PNR or international fare inquiries.
              </p>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                <a href="tel:+918980345600" className="flex items-center gap-2 text-white/80 text-xs hover:text-white">
                  <i className="fas fa-phone w-3" />+91 89803 45600
                </a>
                <a href="https://wa.me/918980345600" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-white/80 text-xs hover:text-white">
                  <i className="fab fa-whatsapp w-3" />WhatsApp Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CouponCard from '../components/CouponCard'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

export default function Dashboard({ darkMode, setDarkMode }) {
  const { user, coupon, couponApplied } = useAuth()
  const navigate = useNavigate()

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Traveller'

  const statsCards = [
    {
      icon: 'fa-ticket-alt',
      label: 'Coupon Status',
      value: couponApplied ? 'Applied' : 'Not Applied',
      color: couponApplied ? 'emerald' : 'gray',
      bg: couponApplied ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-700/50',
    },
    {
      icon: 'fa-percent',
      label: 'Discount Type',
      value: coupon?.discountType === 'FLAT' ? 'Flat Discount' : coupon ? 'Range Discount' : 'N/A',
      color: 'brand',
      bg: 'bg-brand-50 dark:bg-brand-900/20',
    },
    {
      icon: 'fa-rupee-sign',
      label: 'Max Savings',
      value: coupon?.maxDiscount ? `₹${Number(coupon.maxDiscount).toLocaleString()}` : '—',
      color: 'amber',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: 'fa-plane',
      label: 'Flight Routes',
      value: 'Domestic',
      color: 'sky',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
    },
  ]

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

        {/* Stats row */}
        {/*<motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-8">*/}
        {/*  {statsCards.map((card, i) => (*/}
        {/*    <motion.div*/}
        {/*      key={i}*/}
        {/*      initial={{ opacity: 0, y: 20 }}*/}
        {/*      animate={{ opacity: 1, y: 0 }}*/}
        {/*      transition={{ delay: 0.1 + i * 0.05 }}*/}
        {/*      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"*/}
        {/*    >*/}
        {/*      <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>*/}
        {/*        <i className={`fas ${card.icon} text-${card.color}-500 text-sm`} />*/}
        {/*      </div>*/}
        {/*      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">{card.label}</p>*/}
        {/*      <p className={`text-sm font-bold text-${card.color}-600 dark:text-${card.color}-400`}>*/}
        {/*        {card.value}*/}
        {/*      </p>*/}
        {/*    </motion.div>*/}
        {/*  ))}*/}
        {/*</motion.div>*/}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Coupon */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2 space-y-6">
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

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'

function Particle({ style }) {
  return <div className="absolute rounded-full animate-float opacity-70" style={style} />
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185']
const SHAPES = ['circle', 'square', 'triangle']

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    x: Math.random() * 100,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            top: '110%',
            rotate: [0, 180, 360, 540],
            x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

export default function CouponSuccess({ darkMode, setDarkMode }) {
  const { coupon, user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  const code = coupon?.coupenCode || coupon?.code || 'N/A'
  const discount = coupon?.fixPercentage
    ? `${coupon.fixPercentage}% Off`
    : 'Flat Discount'

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success('Coupon copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {showConfetti && <Confetti />}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-20">
        <div className="w-full max-w-lg text-center">

          {/* Success animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-green"
          >
            <i className="fas fa-check text-white text-4xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Welcome, {user?.firstName || 'Traveller'}! 🎉
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
              Your exclusive coupon is ready to use
            </p>
          </motion.div>

          {/* Coupon display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="coupon-card mx-auto max-w-sm mb-6"
          >
            <div className="relative">
              {/* Decorative holes */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-full" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-gray-50 dark:bg-gray-950 rounded-full" />

              <div className="relative text-center py-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <i className="fas fa-ticket-alt text-white/80 text-xl" />
                  <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
                    Bhumi Holiday
                  </span>
                </div>

                <p className="text-white/70 text-xs mb-2">YOUR EXCLUSIVE DISCOUNT</p>
                <p className="text-4xl font-black text-yellow-300 tracking-widest mb-1">{discount}</p>
                <p className="text-white/60 text-xs mb-5">on domestic flights</p>

                <div className="border-t border-dashed border-white/20 pt-4 mb-4" />

                <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Coupon Code</p>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 inline-block min-w-[200px]">
                  <span className="text-2xl font-black tracking-[0.2em] font-mono text-white">
                    {code}
                  </span>
                </div>

                {coupon?.minAmount && (
                  <p className="text-white/50 text-xs mt-3">
                    Min. booking ₹{coupon.minAmount?.toLocaleString()}
                    {coupon?.maxDiscount && ` • Max save ₹${coupon.maxDiscount?.toLocaleString()}`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              onClick={handleCopy}
              className={`btn-secondary px-6 py-3 ${copied ? 'border-emerald-400 text-emerald-600' : ''}`}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`} />
              {copied ? 'Copied!' : 'Copy Coupon Code'}
            </button>
            <button
              onClick={() => navigate('/search')}
              className="btn-primary px-6 py-3"
            >
              <i className="fas fa-search mr-2" />Search Flights Now
            </button>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Go to Dashboard →
          </motion.button>
        </div>
      </div>
    </div>
  )
}

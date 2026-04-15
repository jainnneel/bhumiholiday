import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'

export default function CouponCard({ showActions = true, compact = false }) {
  const { coupon, couponApplied, setCouponApplied } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!coupon) return null

  const code = coupon.coupenCode || coupon.code || 'N/A'
  const discount = coupon.fixPercentage
    ? `${coupon.fixPercentage}% off`
    : coupon.discountType === 'FLAT'
    ? 'Flat Discount'
    : 'Special Discount'

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      toast.success('Coupon code copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
        ${couponApplied
          ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800'
          : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
        }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
          ${couponApplied ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <i className={`fas fa-tag text-sm ${couponApplied ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold font-mono ${couponApplied ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-400 line-through'}`}>
            {code}
          </p>
          <p className="text-xs text-gray-500">
            {couponApplied ? `${discount} – Applied` : 'Not applied'}
          </p>
        </div>
        {showActions && (
          <div className="flex gap-1">
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Copy">
              <i className={`fas ${copied ? 'fa-check text-emerald-500' : 'fa-copy text-gray-400'} text-xs`} />
            </button>
            <button
              onClick={() => setCouponApplied(!couponApplied)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all
                ${couponApplied
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                }`}
            >
              {couponApplied ? 'Remove' : 'Apply'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      className="coupon-card"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Decorative circles */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full" />
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
              Your Exclusive Coupon
            </p>
            <p className="text-white/80 text-sm">{discount}</p>
          </div>
          <div className="flex items-center gap-2">
            {couponApplied && (
              <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-300/30">
                <i className="fas fa-check-circle text-xs" />Applied
              </span>
            )}
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-ticket-alt text-white text-lg" />
            </div>
          </div>
        </div>

        {/* Code display */}
        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-4 mb-4 border border-white/20 flex items-center justify-between">
          <span className="text-2xl font-black tracking-[0.15em] font-mono text-white">
            {code}
          </span>
          <button
            onClick={handleCopy}
            className="ml-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all active:scale-95"
            title="Copy code"
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-white`} />
          </button>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between text-white/70 text-xs mb-4">
          {coupon.minAmount && (
            <span><i className="fas fa-info-circle mr-1" />Min ₹{coupon.minAmount?.toLocaleString()}</span>
          )}
          {coupon.maxDiscount && (
            <span>Max save ₹{coupon.maxDiscount?.toLocaleString()}</span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={() => setCouponApplied(!couponApplied)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${couponApplied
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-white text-brand-700 hover:bg-white/90'
                }`}
            >
              {couponApplied ? (
                <><i className="fas fa-times mr-2" />Remove Coupon</>
              ) : (
                <><i className="fas fa-tag mr-2" />Apply Coupon</>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/20 transition-all"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-1`} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FlightSearchWidget from '../components/FlightSearchWidget'
import logoUrl from '../assets/logo.jpeg'

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y:  0 },
  viewport:    { once: true, margin: '-40px' },
  transition:  { delay, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
})

const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:    { once: true },
  transition:  { delay, duration: 0.5 },
})

// ─── Static data ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '50K+',  label: 'Searches done',   icon: 'fa-search'  },
  { value: '7',     label: 'Airlines covered', icon: 'fa-plane'   },
  { value: '5%',    label: 'Flat savings',     icon: 'fa-tag'     },
  { value: '< 30s', label: 'To sign up',       icon: 'fa-bolt'    },
]

const FEATURES = [
  {
    icon:  'fa-tag',
    title: 'Exclusive Coupons',
    desc:  'Get a personalised Up to 5% discount coupon the moment you sign up — auto-applied on every search.',
    color: 'amber',
    grad:  'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
    ic:    'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    icon:  'fa-bolt',
    title: 'Real-time Pricing',
    desc:  'Live fares from all major Indian airlines. No stale data, no checkout surprises.',
    color: 'brand',
    grad:  'from-brand-50 to-sky-50 dark:from-brand-900/10 dark:to-sky-900/10',
    ic:    'text-brand-600 bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400',
  },
  {
    icon:  'fa-brands fa-whatsapp',
    title: 'WhatsApp Booking',
    desc:  'One-tap inquiry to our team with all flight details prefilled. We handle the rest.',
    color: 'emerald',
    grad:  'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10',
    ic:    'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    icon:  'fa-shield-alt',
    title: 'Passwordless Auth',
    desc:  'Secure OTP-based login. Just your email — nothing to remember or store.',
    color: 'purple',
    grad:  'from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10',
    ic:    'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    icon:  'fa-plane',
    title: 'All Major Airlines',
    desc:  'IndiGo, Air India, SpiceJet, Vistara, Akasa Air and more — in one unified search.',
    color: 'sky',
    grad:  'from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10',
    ic:    'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400',
  },
  {
    icon:  'fa-moon',
    title: 'Dark Mode',
    desc:  'Beautiful, eye-friendly dark theme that remembers your preference.',
    color: 'slate',
    grad:  'from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/40',
    ic:    'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  },
]

const HOW_IT_WORKS = [
  { step: '01', icon: 'fa-user-plus',         title: 'Create Account',    desc: 'Sign up with email + OTP in under 30 seconds. No password required.' },
  { step: '02', icon: 'fa-gift',              title: 'Receive Coupon',    desc: 'A personal Up to 5% discount code is generated and emailed instantly.' },
  { step: '03', icon: 'fa-search',            title: 'Search Flights',    desc: 'Find domestic fares with your coupon auto-applied for instant savings.' },
  { step: '04', icon: 'fa-brands fa-whatsapp', title: 'Book via WhatsApp', desc: 'Send a full flight inquiry to our team in one tap. Done.' },
]

const AIRLINES = [
  { name: 'IndiGo',           code: '6E', color: '#1E3A7B' },
  { name: 'Air India',        code: 'AI', color: '#E6243B' },
  { name: 'SpiceJet',         code: 'SG', color: '#E84B0C' },
  { name: 'Vistara',          code: 'UK', color: '#4B2D83' },
  { name: 'Akasa Air',        code: 'QP', color: '#F97316' },
  { name: 'Air Asia',         code: 'I5', color: '#E60000' },
  { name: 'Air India Express',code: 'IX', color: '#C0392B' },
]

// ─── Blurred coupon teaser for guests ────────────────────────────────────────
function CouponTeaser() {
  return (
    <div className="relative rounded-3xl overflow-hidden">
      {/* Blurred coupon preview */}
      <div className="select-none pointer-events-none" style={{ filter: 'blur(7px)', opacity: 0.55 }}>
        <div className="coupon-card-premium">
          <div className="text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Your Exclusive Coupon</p>
            <p className="text-5xl font-black text-yellow-300 mb-3">Up to 5%</p>
            <div className="bg-white/10 rounded-2xl px-8 py-3 border border-white/20 inline-block">
              <span className="text-2xl font-black tracking-[0.25em] font-mono text-white">BH••••••</span>
            </div>
            <p className="text-white/40 text-xs mt-3">Min. ₹1,000 · Max. ₹5,000 savings</p>
          </div>
        </div>
      </div>

      {/* Glassmorphic unlock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/5 to-gray-50/60 dark:to-gray-950/70">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl
                        border border-white dark:border-gray-700 px-8 py-6 text-center mx-6">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-lock text-amber-500 text-lg" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">Unlock Your Free Coupon</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Sign up free to get a personalised<br />Up to 5% discount on every flight
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500
                       hover:from-brand-700 hover:to-brand-600 text-white text-sm font-bold
                       px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/30
                       hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5">
            <i className="fas fa-gift" />Get Free Coupon
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage({ darkMode, setDarkMode }) {
  const { user } = useAuth()
  const navigate  = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 overflow-x-hidden">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} transparent />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — gradient background + embedded search widget
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-start pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d1a7a 0%, #1340d8 40%, #0ea5e9 75%, #38bdf8 100%)' }}>

        {/* Background texture — subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-sky-300/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating plane decoration */}
        <motion.div
          animate={{ y: [-16, 16, -16], x: [-4, 4, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-6 top-1/3 hidden xl:block pointer-events-none select-none"
          style={{ opacity: 0.06 }}
        >
          <i className="fas fa-plane text-[200px] text-white" style={{ transform: 'rotate(-15deg)' }} />
        </motion.div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 w-full">

          {/* ── Headline group — compact on mobile so search is above fold ── */}
          <div className="text-center mb-5 sm:mb-8">
            {/* Badge — hidden on xs to save height */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1,  y:   0 }}
              className="hidden sm:inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm
                         border border-white/20 text-white text-xs font-semibold
                         rounded-full px-4 py-1.5 mb-5 tracking-wide"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trust to Satisfaction
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="text-[2.4rem] leading-[1.1] sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3 sm:mb-4"
            >
              {/*Fly Smarter with{' '}*/}
              {/*<span className="text-yellow-300 drop-shadow-[0_2px_12px_rgba(253,224,71,0.35)]">*/}
              {/*  Exclusive Deals*/}
              {/*</span>*/}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="text-white/70 text-sm sm:text-lg max-w-lg mx-auto leading-relaxed mb-4 sm:mb-5"
            >
              {/*Live domestic fares + personal discount coupons — search free, no sign-up needed.*/}
            </motion.p>

            {/* Trust badges — single row on mobile, horizontal on sm+ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-white/60 text-xs sm:text-sm"
            >
              <span className="flex items-center gap-1.5">
                <i className="fas fa-check-circle text-emerald-400 text-xs" />No account needed
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <i className="fas fa-gift text-amber-400 text-xs" />Free coupon on signup
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fab fa-whatsapp text-green-400 text-xs" />WhatsApp booking
              </span>
            </motion.div>
          </div>

          {/* ── Search Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1,  y:  0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 20 }}
          >
            {/* Guest nudge — compact single line on mobile */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1,  y:  0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2.5 bg-amber-400/15 backdrop-blur-sm
                           border border-amber-400/30 rounded-2xl px-4 py-2.5 mb-3"
              >
                <i className="fas fa-gift text-amber-300 text-sm flex-shrink-0" />
                <p className="text-xs sm:text-sm text-white/85 flex-1 min-w-0">
                  <strong className="text-white">FREE Up to 5% coupon</strong>
                  <span className="hidden sm:inline"> — sign up in 30 seconds</span>
                </p>
                <Link to="/signup"
                  className="flex-shrink-0 text-xs font-bold text-amber-900 bg-amber-300
                             hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                  Get it free
                </Link>
              </motion.div>
            )}

            {/* Search card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/20
                            border border-white/60 dark:border-gray-700 p-4 sm:p-6 md:p-8">
              <FlightSearchWidget navigates />
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden" preserveAspectRatio="none">
            <path d="M0 72H1440V36C1200 72 960 0 720 36C480 72 240 0 0 36V72Z" fill="white"/>
          </svg>
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block" preserveAspectRatio="none">
            <path d="M0 72H1440V36C1200 72 960 0 720 36C480 72 240 0 0 36V72Z" fill="#030712"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={i} {...fadeIn(i * 0.07)}
                className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl mb-2.5">
                  <i className={`fas ${s.icon} text-brand-600 dark:text-brand-400 text-sm`} />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          AIRLINES STRIP
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            All major airlines, one search
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {AIRLINES.map((a) => (
              <div key={a.name}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60
                           rounded-2xl border border-gray-100 dark:border-gray-700
                           hover:border-brand-200 dark:hover:border-brand-700
                           hover:bg-brand-50/50 dark:hover:bg-brand-900/10
                           hover:shadow-sm transition-all duration-200 cursor-default">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                  style={{ backgroundColor: a.color }}>
                  {a.code}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          COUPON DISCOVERY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50/70 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text side */}
            <motion.div {...fadeUp()}>
              <span className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30
                               text-amber-700 dark:text-amber-400 text-[11px] font-bold
                               uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5">
                <i className="fas fa-gift" />Exclusive Offer
              </span>

              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-5 leading-tight">
                Your personal<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-sky-500">
                  Up to 5% discount
                </span>
              </h2>

              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                Sign up free and receive a personalised coupon code — auto-applied on every flight search. Emailed instantly.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  { text: 'Up to 5% flat discount on all domestic flights', icon: 'fa-plane-departure' },
                  { text: 'Auto-applied — no manual entry needed',    icon: 'fa-magic' },
                  { text: 'Remove or re-apply at any time',           icon: 'fa-redo' },
                  { text: 'Coupon emailed immediately after signup',  icon: 'fa-envelope' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${item.icon} text-emerald-500 text-xs`} />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link to="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500
                             hover:from-brand-700 hover:to-brand-600 text-white font-bold
                             px-7 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25
                             hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5
                             transition-all duration-200">
                  <i className="fas fa-rocket" />Get Free Coupon
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-brand-600
                             dark:text-brand-400 font-bold px-7 py-3.5 rounded-2xl border-2
                             border-brand-200 dark:border-brand-700
                             hover:border-brand-400 dark:hover:border-brand-500
                             hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200">
                  Already have one?
                </Link>
              </div>
            </motion.div>

            {/* Visual side */}
            <motion.div {...fadeUp(0.15)}>
              {user ? (
                <div className="coupon-card-premium">
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 bg-emerald-400/20 rounded-full px-3 py-1 mb-4">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white/80 text-xs font-semibold">Coupon Active</span>
                    </div>
                    <p className="text-4xl font-black text-yellow-300 mb-2">Up to 5%</p>
                    <p className="text-white/60 text-sm mb-6">Your exclusive discount is ready</p>
                    <Link to="/dashboard"
                      className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25
                                 text-white font-semibold px-6 py-2.5 rounded-2xl transition-all border border-white/20">
                      <i className="fas fa-th-large" />View Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <CouponTeaser />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-widest mb-3">
              Why Bhumi Holidays
            </p>
            {/*<h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">*/}
            {/*  Everything to fly smarter*/}
            {/*</h2>*/}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className={`relative rounded-2xl p-6 border border-gray-100 dark:border-gray-700/60
                            bg-gradient-to-br ${f.grad}
                            hover:border-brand-200 dark:hover:border-brand-700/60
                            hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                <div className={`w-11 h-11 ${f.ic} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <i className={`fas ${f.icon} text-lg`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-gray-50/70 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
              Get flying in 4 steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px
                            bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-800 to-transparent pointer-events-none" />

            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.09)}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6
                           border border-gray-100 dark:border-gray-700 text-center
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {/* Step number */}
                <span className="absolute top-3.5 right-4 text-[11px] font-black text-gray-200 dark:text-gray-700 tracking-wider">
                  {s.step}
                </span>
                {/* Icon circle */}
                <div className="relative w-14 h-14 mx-auto mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl
                                  flex items-center justify-center text-white text-xl shadow-lg shadow-brand-500/30">
                    <i className={`fas ${s.icon}`} />
                  </div>
                  {/* Glow */}
                  <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-md -z-10" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1a7a 0%, #1340d8 50%, #0ea5e9 100%)' }}>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="white"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-400/20 blur-[120px] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()}>
            <img src={logoUrl} alt="Bhumi Holidays"
              className="h-16 w-16 rounded-2xl object-cover shadow-2xl mx-auto mb-7 ring-4 ring-white/20"
              onError={(e) => { e.target.style.display = 'none' }} />

            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Start saving on<br />flights today
            </h2>

            <p className="text-white/65 text-xl mb-10 leading-relaxed">
              Join thousands of smart travellers booking smarter with Bhumi Holidays.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2.5 bg-white text-brand-700
                           hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl shadow-xl
                           hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-base">
                <i className="fas fa-rocket" />Get Started Free
              </Link>
              <button onClick={() => navigate('/search')}
                className="inline-flex items-center justify-center gap-2.5 bg-white/12 hover:bg-white/20
                           border border-white/25 text-white font-semibold px-8 py-4 rounded-2xl
                           hover:-translate-y-0.5 transition-all duration-200 text-base backdrop-blur-sm">
                <i className="fas fa-search" />Search Flights
              </button>
            </div>

            {/* Mini trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10 text-white/40 text-xs font-medium">
              <span><i className="fas fa-lock mr-1.5" />Secure OTP login</span>
              <span><i className="fas fa-shield-alt mr-1.5" />No spam, ever</span>
              <span><i className="fas fa-times-circle mr-1.5" />Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

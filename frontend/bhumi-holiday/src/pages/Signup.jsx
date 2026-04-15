import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import logoUrl from '../assets/logo.jpeg'

const STEPS = [
  { id: 1, label: 'Email',   icon: 'fa-envelope' },
  { id: 2, label: 'Verify',  icon: 'fa-shield-alt' },
  { id: 3, label: 'Profile', icon: 'fa-user' },
]

export default function Signup({ darkMode, setDarkMode }) {
  const { sendOtp, verifyOtp, signup } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]           = useState(1)
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [profile, setProfile]     = useState({ firstName: '', lastName: '', phone: '', company: '' })
  const [loading, setLoading]     = useState(false)
  const [otpTimer, setOtpTimer]   = useState(0)   // seconds remaining
  const timerRef                  = useRef(null)
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const startTimer = () => {
    setOtpTimer(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  /* ─ Step 1: Send OTP ─ */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return toast.error('Invalid email address')

    setLoading(true)
    const res = await sendOtp(email)
    setLoading(false)

    if (res.ok) {
      toast.success('OTP sent!')
      if (res.mockOtp) toast(`[DEV] OTP: ${res.mockOtp}`, { icon: '🔑', duration: 10000 })
      startTimer()
      setStep(2)
    } else {
      toast.error(res.error || 'Failed to send OTP')
    }
  }

  /* ─ OTP handlers ─ */
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const u = [...otp]; u[i] = val.slice(-1); setOtp(u)
    if (val && i < 5) otpRefs[i + 1].current?.focus()
  }
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus()
  }
  const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length === 6) { setOtp(p.split('')); otpRefs[5].current?.focus() }
  }

  /* ─ Step 2: Verify OTP ─ */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter the 6-digit OTP')

    setLoading(true)
    const res = await verifyOtp(email, code)
    setLoading(false)

    if (res.ok) {
      toast.success('Email verified!')
      setStep(3)
    } else {
      toast.error(res.error || 'Invalid OTP')
    }
  }

  /* ─ Step 3: Complete signup ─ */
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!profile.firstName.trim()) return toast.error('First name is required')
    if (!profile.phone.trim())     return toast.error('Phone number is required')

    setLoading(true)
    const res = await signup({ ...profile, email })
    setLoading(false)

    if (res.ok) {
      if (res.coupon) {
        toast.success('Account created! Coupon sent to your email 📩', { duration: 5000 })
        navigate('/coupon-success')
      } else {
        toast.success('Account created successfully!')
        navigate('/dashboard')
      }
    } else {
      toast.error(res.error || 'Signup failed')
    }
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <img src={logoUrl} alt="Bhumi Holiday"
              className="h-16 w-16 rounded-2xl object-cover shadow-lg mx-auto mb-4"
              onError={(e) => { e.target.style.display = 'none' }} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Get exclusive flight deals instantly</p>
          </motion.div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <motion.div
                  animate={step === s.id ? { scale: 1.1 } : { scale: 1 }}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-bold transition-all
                    ${step > s.id ? 'step-done' : step === s.id ? 'step-active' : 'step-pending dark:border-gray-600 dark:text-gray-500'}`}
                >
                  {step > s.id ? <i className="fas fa-check text-xs" /> : s.id}
                </motion.div>
                <span className={`text-xs font-medium hidden sm:block
                  ${step === s.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full mx-1 transition-all
                    ${step > s.id ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {/* ── Step 1: Email ── */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enter your email</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">We'll send you a verification code</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="fas fa-envelope" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-premium pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        autoFocus required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? <><i className="fas fa-circle-notch fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send OTP</>}
                  </button>
                </motion.form>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-shield-alt text-brand-600 text-xl" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Verify your email</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Code sent to <strong className="text-gray-700 dark:text-gray-300">{email}</strong></p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                      One-Time Password
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="otp-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? <><i className="fas fa-circle-notch fa-spin" /> Verifying...</> : <><i className="fas fa-check-circle" /> Verify Email</>}
                  </button>
                  <div className="flex justify-between items-center text-sm">
                    <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                      <i className="fas fa-arrow-left mr-1" />Back
                    </button>
                    {otpTimer > 0 ? (
                      <span className="text-gray-400 dark:text-gray-500 text-xs tabular-nums">
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sendOtp(email).then((r) => {
                            if (r.ok) {
                              toast.success('OTP resent!')
                              if (r.mockOtp) toast(`[DEV] ${r.mockOtp}`, { icon: '🔑', duration: 8000 })
                              startTimer()
                            } else {
                              toast.error(r.error || 'Failed to resend OTP')
                            }
                          })
                        }}
                        className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </motion.form>
              )}

              {/* ── Step 3: Profile ── */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Complete your profile</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Just a few more details</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="John"
                        className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Doe"
                        className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        <i className="fas fa-phone" />
                      </span>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="input-premium pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        <i className="fas fa-building" />
                      </span>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        placeholder="Your company (optional)"
                        className="input-premium pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 text-sm"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                    {loading ? (
                      <><i className="fas fa-circle-notch fa-spin" /> Creating Account...</>
                    ) : (
                      <><i className="fas fa-rocket" /> Create Account & Get Coupon</>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Sign in link */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

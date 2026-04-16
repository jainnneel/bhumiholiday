import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../store/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BrandLogo from '../components/Logo'

const STEP = { EMAIL: 'email', OTP: 'otp' }

export default function Login({ darkMode, setDarkMode }) {
  const { sendOtp, verifyOtp, login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]           = useState(STEP.EMAIL)
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [loading, setLoading]     = useState(false)
  const [otpTimer, setOtpTimer]   = useState(0)
  const timerRef                  = useRef(null)
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const startTimer = () => {
    setOtpTimer(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setOtpTimer((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  /* ── Send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return toast.error('Please enter a valid email')

    setLoading(true)
    const res = await sendOtp(email)
    setLoading(false)

    if (res.ok) {
      toast.success('OTP sent to your email!')
      startTimer()
      setStep(STEP.OTP)
    } else {
      toast.error(res.error || 'Failed to send OTP')
    }
  }

  /* ── OTP input handlers ── */
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const updated = [...otp]
    updated[idx] = val.slice(-1)
    setOtp(updated)
    if (val && idx < 5) otpRefs[idx + 1].current?.focus()
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs[5].current?.focus()
    }
  }

  /* ── Verify OTP & login ── */
  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Please enter the 6-digit OTP')

    setLoading(true)
    const vRes = await verifyOtp(email, code)
    if (!vRes.ok) { setLoading(false); return toast.error(vRes.error || 'Invalid OTP') }

    const lRes = await login(email)
    setLoading(false)

    if (lRes.ok) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(lRes.error || 'Login failed')
    }
  }

  const handleResend = async () => {
    const res = await sendOtp(email)
    if (res.ok) {
      toast.success('OTP resent!')
      if (res.mockOtp) toast(`[DEV] OTP: ${res.mockOtp}`, { icon: '🔑', duration: 10000 })
      startTimer()
      setOtp(['', '', '', '', '', ''])
      otpRefs[0].current?.focus()
    } else {
      toast.error(res.error || 'Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to Bhumi Holiday</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8"
          >
            {step === STEP.EMAIL ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
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
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? (
                    <><i className="fas fa-circle-notch fa-spin" /> Sending OTP...</>
                  ) : (
                    <><i className="fas fa-paper-plane" /> Send OTP</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-shield-alt text-brand-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{email}</p>
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
                  {loading ? (
                    <><i className="fas fa-circle-notch fa-spin" /> Verifying...</>
                  ) : (
                    <><i className="fas fa-check-circle" /> Verify & Sign In</>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep(STEP.EMAIL); setOtp(['', '', '', '', '', '']); clearInterval(timerRef.current); setOtpTimer(0) }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    <i className="fas fa-arrow-left mr-1" />Change Email
                  </button>
                  {otpTimer > 0 ? (
                    <span className="text-gray-400 dark:text-gray-500 text-xs tabular-nums">
                      Resend in {otpTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-700">
                Sign up free
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400"
          >
            <span className="flex items-center gap-1"><i className="fas fa-lock text-brand-400" />Secure Login</span>
            <span className="flex items-center gap-1"><i className="fas fa-shield-alt text-brand-400" />OTP Verified</span>
            <span className="flex items-center gap-1"><i className="fas fa-user-shield text-brand-400" />Private</span>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

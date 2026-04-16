import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, userAPI, couponAPI } from '../services/api'

const AuthContext = createContext(null)

const SESSION_KEY = 'bh_session'
const COUPON_KEY  = 'bh_coupon'

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null)   // user profile object
  const [coupon,        setCoupon]        = useState(null)   // coupon object
  const [couponApplied, setCouponApplied] = useState(true)   // whether coupon is active
  const [loading,       setLoading]       = useState(true)   // initial hydration

  // ── Hydrate from localStorage ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw  = localStorage.getItem(SESSION_KEY)
      const rawC = localStorage.getItem(COUPON_KEY)
      if (raw)  setUser(JSON.parse(raw))
      if (rawC) setCoupon(JSON.parse(rawC))
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  // ── Persist user ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user)  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else       localStorage.removeItem(SESSION_KEY)
  }, [user])

  // ── Persist coupon ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon))
    else        localStorage.removeItem(COUPON_KEY)
  }, [coupon])

  // ── Helper: normalise coupon from different API shapes ───────────────────────
  const normaliseCoupon = (raw) => {
    if (!raw) return null
    // Backend returns coupenCode (CoupenEntity shape)
    // Frontend also stores coupon.code from older flow — handle both
    return {
      ...raw,
      code:      raw.coupenCode || raw.code || '',
      coupenCode: raw.coupenCode || raw.code || '',
    }
  }

  // ── sendOtp ──────────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async (email) => {
    try {
      const res = await authAPI.sendOtp(email)
      // Backend returns { success, message, otp } — otp is present for dev mode
      const data = res.data || {}
      return { ok: true }
    } catch (err) {
      // Graceful local fallback when backend is unreachable
      if (import.meta.env.DEV) {
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
        sessionStorage.setItem('__mock_otp__' + email.toLowerCase(), mockOtp)
        return { ok: true }
      }
      return { ok: false, error: err?.response?.data?.message || 'Failed to send OTP' }
    }
  }, [])

  // ── verifyOtp ────────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async (email, otp) => {
    try {
      await authAPI.verifyOtp(email, otp)
      return { ok: true }
    } catch (err) {
      // Dev fallback: compare against sessionStorage mock
      if (import.meta.env.DEV) {
        const saved = sessionStorage.getItem('__mock_otp__' + email.toLowerCase())
        if (saved === otp) return { ok: true }
      }
      return {
        ok:    false,
        error: err?.response?.data?.message || 'Invalid OTP. Please try again.',
      }
    }
  }, [])

  // ── signup ───────────────────────────────────────────────────────────────────
  /**
   * Calls POST /auth/signup.
   * The backend creates the user AND generates a FLAT 4% coupon in one shot.
   * Response shape: AuthResponse { success, userId, firstName, ..., coupon }
   */
  const signup = useCallback(async (profile) => {
    try {
      const res  = await authAPI.signup(profile)
      const data = res.data  // AuthResponse

      if (!data.success && data.message) {
        return { ok: false, error: data.message }
      }

      // Build user object from response
      const userData = {
        id:        data.userId,
        firstName: data.firstName || profile.firstName,
        lastName:  data.lastName  || profile.lastName  || '',
        email:     data.email     || profile.email,
        phone:     data.phone     || profile.phone     || '',
        company:   data.company   || profile.company   || '',
        pan:       data.pan       || profile.pan       || '',
        gst:       data.gst       || profile.gst       || '',
        address:   data.address   || profile.address   || '',
      }
      setUser(userData)

      // Coupon is returned directly from signup response
      const newCoupon = normaliseCoupon(data.coupon)
      if (newCoupon) {
        setCoupon(newCoupon)
        setCouponApplied(true)
      }

      return { ok: true, coupon: newCoupon }
    } catch (err) {
      const msg = err?.response?.data?.message

      // Dev fallback when backend is unreachable
      if (import.meta.env.DEV) {
        setUser(profile)
        const fallback = await generateCouponFallback(profile.email)
        return { ok: true, coupon: fallback }
      }
      return { ok: false, error: msg || 'Signup failed. Please try again.' }
    }
  }, [])

  // ── login ────────────────────────────────────────────────────────────────────
  /**
   * After OTP verification the frontend calls login(email) to hydrate the user
   * profile and coupon from the backend.
   */
  const login = useCallback(async (email) => {
    try {
      // GET /user/profile?email=... returns UserProfileResponse { ..., coupon }
      const res      = await userAPI.getProfile(email)
      const data     = res.data
      const userData = {
        id:        data.userId,
        firstName: data.firstName || email.split('@')[0],
        lastName:  data.lastName  || '',
        email:     data.email     || email,
        phone:     data.phone     || '',
        company:   data.company   || '',
        pan:       data.pan       || '',
        gst:       data.gst       || '',
        address:   data.address   || '',
      }
      setUser(userData)

      const fetchedCoupon = normaliseCoupon(data.coupon)
      if (fetchedCoupon) {
        setCoupon(fetchedCoupon)
        setCouponApplied(true)
      } else {
        // Try dedicated coupon endpoint as fallback
        try {
          const cpRes = await userAPI.getCoupon(email)
          const fc    = normaliseCoupon(cpRes.data)
          if (fc) { setCoupon(fc); setCouponApplied(true) }
        } catch { /* user has no coupon yet */ }
      }

      return { ok: true }
    } catch (err) {
      // 404 = new user who hasn't signed up yet, or backend unreachable
      if (import.meta.env.DEV) {
        const mockUser = {
          email,
          firstName: email.split('@')[0],
          lastName:  '',
          phone:     '',
          company:   '',
        }
        setUser(mockUser)
        // Try to pull coupon anyway
        try {
          const cpRes = await userAPI.getCoupon(email)
          const fc    = normaliseCoupon(cpRes.data)
          if (fc) { setCoupon(fc); setCouponApplied(true) }
        } catch { /* ignore */ }
        return { ok: true }
      }
      return {
        ok:    false,
        error: err?.response?.data?.message || 'Login failed. Please try again.',
      }
    }
  }, [])

  // ── logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null)
    setCoupon(null)
    setCouponApplied(true)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(COUPON_KEY)
  }, [])

  // ── generateCoupon (explicit — used when backend is available post-login) ───
  const generateCoupon = useCallback(async (email) => {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
    const dto = {
      coupenCode:    `BH${suffix}`,
      discountType:  'FLAT',
      fixPercentage: 4,
      minAmount:     1000,
      maxDiscount:   5000,
    }
    try {
      const res    = await couponAPI.create(dto)
      const created = normaliseCoupon(res.data)
      setCoupon(created)
      setCouponApplied(true)
      return created
    } catch {
      return await generateCouponFallback(email)
    }
  }, [])

  // ── Dev-only coupon fallback (backend unreachable) ───────────────────────────
  const generateCouponFallback = async (email) => {
    try {
      const cpRes = await userAPI.getCoupon(email)
      const fc    = normaliseCoupon(cpRes.data)
      if (fc) { setCoupon(fc); setCouponApplied(true); return fc }
    } catch { /* ignore */ }
    const local = {
      coupenCode:    'BHWELCOME',
      code:          'BHWELCOME',
      discountType:  'FLAT',
      fixPercentage: 4,
      minAmount:     1000,
      maxDiscount:   5000,
      local:         true,
    }
    setCoupon(local)
    setCouponApplied(true)
    return local
  }

  const value = {
    user, coupon, couponApplied, loading,
    setCouponApplied,
    sendOtp, verifyOtp, signup, login, logout, generateCoupon,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

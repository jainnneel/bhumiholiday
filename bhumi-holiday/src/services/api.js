import axios from 'axios'

// Base URL — uses Vite dev proxy in dev, direct in prod
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bhumiholidays.in'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Auth API ────────────────────────────────────────────────────────────────
// Backend: POST /auth/send-otp   → { success, message, otp? }
//          POST /auth/verify-otp → { success, message }
//          POST /auth/signup     → AuthResponse { success, userId, firstName,
//                                                 lastName, email, phone,
//                                                 company, coupon }
export const authAPI = {
  sendOtp: (email) =>
    http.post('/auth/send-otp', { email }),

  verifyOtp: (email, otp) =>
    http.post('/auth/verify-otp', { email, otp }),

  signup: (profile) =>
    http.post('/auth/signup', {
      firstName: profile.firstName,
      lastName:  profile.lastName  || '',
      email:     profile.email,
      phone:     profile.phone,
      company:   profile.company   || '',
    }),
}

// ─── User API ────────────────────────────────────────────────────────────────
// Backend: GET /user/profile?email=... → UserProfileResponse { ..., coupon }
//          GET /user/coupon?email=...  → CoupenEntity
export const userAPI = {
  getProfile: (email) =>
    http.get('/user/profile', { params: { email } }),

  getCoupon: (email) =>
    http.get('/user/coupon', { params: { email } }),
}

// ─── Coupon API ───────────────────────────────────────────────────────────────
// Backend: POST /coupen → CoupenEntity
//          GET  /coupen → List<CoupenEntity>
export const couponAPI = {
  /**
   * Create a new coupon.
   * dto: { coupenCode, discountType, fixPercentage, minAmount, maxDiscount }
   */
  create: (dto) => http.post('/coupen', dto),

  getAll: () => http.get('/coupen'),
}

// ─── Flight API ───────────────────────────────────────────────────────────────
// Backend: GET /find/{from}/{to}/{date}/{adult}/{child}/{infants}/{coupon}
//          GET /search/{keyword}
export const flightAPI = {
  /**
   * @param {string}      from
   * @param {string}      to
   * @param {string}      date     YYYY-MM-DD
   * @param {number}      adults
   * @param {number}      children
   * @param {number}      infants
   * @param {string|null} coupon
   */
  search: (from, to, date, adults, children, infants, coupon) => {
    const cp = coupon && coupon.trim() ? coupon.trim() : 'null'
    return http.get(
      `/find/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
        + `/${date}/${adults}/${children}/${infants}/${cp}`
    )
  },

  searchAirport: (keyword) =>
    http.get(`/search/${encodeURIComponent(keyword)}`),
}

export default http

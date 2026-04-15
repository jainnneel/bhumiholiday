# Bhumi Holiday – Frontend

Modern React frontend for the Bhumi Holiday flight booking platform.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** – utility-first styling
- **Framer Motion** – animations & page transitions
- **React Router v6** – client-side routing
- **Axios** – HTTP client
- **React Hot Toast** – notifications

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
cd bhumi-holiday
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> Make sure the Spring Boot backend is running on `http://localhost:8084`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── assets/          # Logo and static images
├── components/
│   ├── CouponCard.jsx   # Reusable coupon display/toggle
│   ├── Footer.jsx
│   ├── LoadingScreen.jsx
│   └── Navbar.jsx       # Sticky navbar with dark mode toggle
├── pages/
│   ├── LandingPage.jsx  # Hero + features + how it works
│   ├── Login.jsx        # Email → OTP → Dashboard
│   ├── Signup.jsx       # 3-step: Email → OTP → Profile
│   ├── CouponSuccess.jsx # Celebration screen with confetti
│   ├── Dashboard.jsx    # User dashboard with coupon card
│   └── FlightSearch.jsx # Full-featured flight search (feature parity)
├── services/
│   └── api.js           # Axios instances for all backend calls
├── store/
│   └── AuthContext.jsx  # Global auth + coupon state
└── utils/
    ├── flightUtils.js   # Flight normalisation & filtering
    └── whatsappMessage.js # WhatsApp message builder (exact format)
```

## API Endpoints (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/find/{from}/{to}/{date}/{adult}/{child}/{infrant}/{coupon}` | GET | Search flights |
| `/search/{keyword}` | GET | Airport autocomplete |
| `/coupen` | GET | Get all coupons |
| `/auth/send-otp` | POST | Send OTP to email |
| `/auth/verify-otp` | POST | Verify OTP |
| `/auth/signup` | POST | Register user |
| `/user/profile` | GET | Get user profile |
| `/user/coupon` | GET | Get user coupon |

> **Dev mode**: If auth endpoints don't exist yet, OTP is mocked via `sessionStorage`. The mock OTP is shown in a toast notification.

## Features

- ✅ OTP-based authentication (Login + 3-step Signup)
- ✅ Exclusive coupon generation on signup
- ✅ Coupon auto-applied by default, removable/re-applicable
- ✅ Flight search with all fields matching `index.html`
- ✅ Airport autocomplete via `/search/{key}`
- ✅ Filter by airline, keyword, stops, price range
- ✅ WhatsApp booking inquiry (exact message format preserved)
- ✅ Celebration screen with confetti on signup
- ✅ Dashboard with profile + coupon card
- ✅ Dark mode toggle
- ✅ Fully responsive (mobile-first)
- ✅ Smooth Framer Motion animations

## Environment Variables

Create `.env.local` if you need to override the API base URL:

```
VITE_API_URL=http://localhost:8084
```

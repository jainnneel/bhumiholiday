import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/AuthContext'
import { useState, useEffect } from 'react'

import LandingPage    from './pages/LandingPage'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Dashboard      from './pages/Dashboard'
import FlightSearch   from './pages/FlightSearch'
import CouponSuccess  from './pages/CouponSuccess'
// import ContactPage    from './pages/ContactPage'
import LoadingScreen  from './components/LoadingScreen'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bh_dark') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('bh_dark', darkMode)
  }, [darkMode])

  if (loading) return <LoadingScreen />

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={
          <LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />
        } />

        <Route path="/login" element={
          <GuestRoute>
            <Login darkMode={darkMode} setDarkMode={setDarkMode} />
          </GuestRoute>
        } />

        <Route path="/signup" element={
          <GuestRoute>
            <Signup darkMode={darkMode} setDarkMode={setDarkMode} />
          </GuestRoute>
        } />

        <Route path="/coupon-success" element={
          <ProtectedRoute>
            <CouponSuccess darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <FlightSearch darkMode={darkMode} setDarkMode={setDarkMode} />
        } />

        <Route path="/contact" element={
          <ContactPage darkMode={darkMode} setDarkMode={setDarkMode} />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

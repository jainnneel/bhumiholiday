import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import logoUrl from '../assets/logo.jpeg'

export default function Navbar({ darkMode, setDarkMode, transparent = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropOpen(false)
  }

  const navBase  = transparent && !scrolled && !menuOpen
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm dark:bg-gray-900/95'

  const textCol  = transparent && !scrolled && !menuOpen
    ? 'text-white'
    : 'text-gray-700 dark:text-gray-200'

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBase}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img
              src={logoUrl}
              alt="Bhumi Holiday"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="min-w-0">
              <span className={`font-bold text-base sm:text-lg leading-tight block truncate ${transparent && !scrolled ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                Bhumi Holiday
              </span>
              {/*<span className={`text-[10px] sm:text-xs leading-none block ${transparent && !scrolled ? 'text-white/65' : 'text-brand-500'}`}>*/}
              {/*  Fly Smarter*/}
              {/*</span>*/}
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/search"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive('/search')
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'
                      : `${textCol} hover:bg-white/10 dark:hover:bg-gray-700`
                    }`}
                >
                  <i className="fas fa-search mr-1.5" />Search Flights
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive('/dashboard')
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'
                      : `${textCol} hover:bg-white/10 dark:hover:bg-gray-700`
                    }`}
                >
                  <i className="fas fa-th-large mr-1.5" />Dashboard
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${textCol} hover:bg-white/10`}>
                  Features
                </a>
                <a href="#how-it-works" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${textCol} hover:bg-white/10`}>
                  How It Works
                </a>
              </>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${textCol} hover:bg-white/10 dark:hover:bg-gray-700`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-sm`} />
            </button>

            {/* Guest coupon badge */}
            {!user && (
              <Link to="/signup"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all animate-pulse-slow
                  ${transparent && !scrolled
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                  }`}
              >
                <i className="fas fa-gift text-[11px]" />
                Free Coupon
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                    ${scrolled || !transparent
                      ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${scrolled || !transparent ? 'bg-brand-600 text-white' : 'bg-white/20 text-white'}`}>
                    {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.firstName || user.email}</span>
                  <i className="fas fa-chevron-down text-xs opacity-60" />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email || user.firstName}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <i className="fas fa-th-large w-4 text-brand-500" />Dashboard
                        </Link>
                        <Link to="/search" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <i className="fas fa-search w-4 text-brand-500" />Search Flights
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <i className="fas fa-sign-out-alt w-4" />Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${transparent && !scrolled
                      ? 'bg-white/15 text-white hover:bg-white/25 border border-white/30'
                      : 'text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20'
                    }`}>
                  Sign In
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-brand-700 hover:bg-brand-50 shadow-sm transition-all">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${textCol} hover:bg-white/10`}
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl mb-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                      {(user.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <i className="fas fa-th-large text-brand-500 w-4" />Dashboard
                  </Link>
                  <Link to="/search" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <i className="fas fa-search text-brand-500 w-4" />Search Flights
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                    <i className="fas fa-sign-out-alt w-4" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <i className="fas fa-gift" />
                    Get FREE Coupon
                  </Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../store/AuthContext'
import BrandLogo from './Logo'

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [dropOpen,  setDropOpen]  = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => {
    logout(); navigate('/'); setDropOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navCls = 'bg-white shadow-sm dark:bg-gray-900'

  const isLight = true

  const linkBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
  const linkIdle = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
  const linkActive = 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navCls}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex-shrink-0">
            <BrandLogo size="md" showText transparent={false} />
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {user ? (
              <>
                <Link to="/search"    className={`${linkBase} ${isActive('/search')    ? linkActive : linkIdle}`}>
                  <i className="fas fa-search mr-1.5 text-xs" />Search Flights
                </Link>
                <Link to="/dashboard" className={`${linkBase} ${isActive('/dashboard') ? linkActive : linkIdle}`}>
                  <i className="fas fa-th-large mr-1.5 text-xs" />Dashboard
                </Link>
              </>
            ) : (
              <>
                <a href="#features"    className={`${linkBase} ${linkIdle}`}>Features</a>
                <a href="#how-it-works" className={`${linkBase} ${linkIdle}`}>How It Works</a>
              </>
            )}
            <Link to="/contact" className={`${linkBase} ${isActive('/contact') ? linkActive : linkIdle}`}>
              <i className="fas fa-headset mr-1.5 text-xs" />Contact Us
            </Link>
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors
                ${isLight
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-sm`} />
            </button>

            {/* Free coupon badge (guest only) */}
            {!user && (
              <Link to="/signup"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${isLight
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-amber-400/20 text-amber-200 border border-amber-400/40 hover:bg-amber-400/30'
                  }`}>
                <i className="fas fa-gift text-[11px]" />Free Coupon
              </Link>
            )}

            {/* Contact pill */}
            <Link to="/contact"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${isLight
                  ? 'border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20'
                  : 'border-white/30 text-white/90 hover:bg-white/10 hover:text-white'
                }`}>
              <i className="fas fa-headset text-[11px]" />Contact
            </Link>

            {/* User menu / Sign-in buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                    ${isLight
                      ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.firstName || user.email}</span>
                  <i className="fas fa-chevron-down text-xs opacity-60" />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: -8, scale: 0.95 }}
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
                        <Link to="/contact" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <i className="fas fa-headset w-4 text-brand-500" />Contact Us
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
                    ${isLight
                      ? 'text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20'
                      : 'text-white hover:bg-white/15 border border-white/30'
                    }`}>
                  Sign In
                </Link>
                <Link to="/signup"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all
                    ${isLight
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'bg-white text-brand-700 hover:bg-white/90'
                    }`}>
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors
                ${isLight
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  : 'text-white hover:bg-white/10'
                }`}
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
            exit={{    opacity: 0, height: 0      }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  {/* User chip */}
                  <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl mb-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                      {(user.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {[
                    { to: '/dashboard', icon: 'fa-th-large',    label: 'Dashboard'    },
                    { to: '/search',    icon: 'fa-search',       label: 'Search Flights'},
                    { to: '/contact',   icon: 'fa-headset',      label: 'Contact Us'   },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <i className={`fas ${icon} text-brand-500 w-4`} />{label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <i className="fas fa-sign-out-alt w-4" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <i className="fas fa-gift" />Get FREE Coupon
                  </Link>
                  <Link to="/search" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <i className="fas fa-search text-brand-500" />Search Flights
                  </Link>
                  <Link to="/contact" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <i className="fas fa-headset text-brand-500" />Contact Us
                  </Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700">
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

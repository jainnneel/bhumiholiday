import { Link } from 'react-router-dom'
import logoUrl from '../assets/logo.jpeg'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoUrl} alt="Bhumi Holiday" className="h-9 w-9 rounded-xl object-cover"
                onError={(e) => { e.target.style.display = 'none' }} />
              <div>
                <p className="text-white font-bold text-lg leading-tight">Bhumi Holiday</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Your trusted partner for the best domestic flight fares and exclusive travel deals in India.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Search Flights</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-phone-alt text-brand-400 w-4" />
                <a href="tel:+917878392006" className="hover:text-white transition-colors">+91 78783 92006</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-brand-400 w-4" />
                <a href="mailto:info@bhumiholidays.in" className="hover:text-white transition-colors">info@bhumiholoday.com</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-whatsapp text-green-400 w-4" />
                <a href="https://wa.me/917878392006" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Bhumi Holiday – All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Made with <span className="text-red-400">♥</span> in India</span>
            <div className="flex gap-3">
              <i className="fas fa-shield-alt text-brand-400" title="Secure" />
              <i className="fas fa-lock text-brand-400" title="Encrypted" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

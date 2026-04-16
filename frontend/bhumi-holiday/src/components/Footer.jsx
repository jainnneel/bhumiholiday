import { Link } from 'react-router-dom'
import BrandLogo from './Logo'
import { BRAND, waLink, WA_MSG_GENERAL } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <BrandLogo size="md" transparent className="opacity-90 hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Your trusted partner for the best domestic flight fares and exclusive travel deals in India.
            </p>
            <a
              href={waLink(WA_MSG_GENERAL)}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366]/15 text-[#25d366] border border-[#25d366]/30 text-xs font-bold px-4 py-2 rounded-full hover:bg-[#25d366]/25 transition-all"
            >
              <i className="fab fa-whatsapp text-sm" />Chat with us
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/"        className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/search"  className="hover:text-white transition-colors">Search Flights</Link></li>
              <li><Link to="/login"   className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/signup"  className="hover:text-white transition-colors">Get Free Coupon</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Domestic Flights</li>
              <li>
                <a href={waLink('Hi, I want to inquire about international flights')}
                   target="_blank" rel="noopener noreferrer"
                   className="hover:text-white transition-colors flex items-center gap-1.5">
                  International Flights <span className="text-[10px] text-brand-400 font-bold">(WhatsApp)</span>
                </a>
              </li>
              <li className="text-gray-400">Group Bookings</li>
              <li className="text-gray-400">Exclusive Coupons</li>
              <li>
                <Link to="/contact#bank-details" className="hover:text-white transition-colors">Bank Details</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-phone-alt text-brand-400 w-4 flex-shrink-0" />
                <a href={BRAND.phoneTel} className="hover:text-white transition-colors">{BRAND.phoneIntl}</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-whatsapp text-green-400 w-4 flex-shrink-0" />
                <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: {BRAND.phoneIntl}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-brand-400 w-4 flex-shrink-0" />
                <a href={BRAND.emailHref} className="hover:text-white transition-colors">{BRAND.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt text-brand-400 w-4 flex-shrink-0 mt-0.5" />
                <span>Ahmedabad, Gujarat, India</span>
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

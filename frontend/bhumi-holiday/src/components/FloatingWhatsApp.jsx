/**
 * FloatingWhatsApp
 * A fixed bottom-right WhatsApp bubble that is visible on every page.
 * Expands to show quick-action chips on click (mobile-first).
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { waLink, WA_MSG_DOMESTIC, WA_MSG_INTERNATIONAL, BRAND } from '../utils/constants'

const ACTIONS = [
  {
    label: 'Domestic Flights',
    icon:  'fa-plane',
    href:  waLink(WA_MSG_DOMESTIC),
    color: 'bg-brand-600 hover:bg-brand-700',
  },
  {
    label: 'International Flights',
    icon:  'fa-globe',
    href:  waLink(WA_MSG_INTERNATIONAL),
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    label: 'General Inquiry',
    icon:  'fa-headset',
    href:  waLink(),
    color: 'bg-gray-700 hover:bg-gray-800',
  },
]

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[300] flex flex-col items-end gap-3">

      {/* Action chips */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1      }}
            exit={{    opacity: 0, y: 12, scale: 0.92   }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-2"
          >
            {/* tooltip */}
            <p className="text-[11px] font-semibold text-white bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full mb-1">
              How can we help?
            </p>
            {ACTIONS.map((a) => (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg transition-all ${a.color}`}
              >
                <i className={`fas ${a.icon} text-sm`} />{a.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bubble */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{   scale: 0.94 }}
        className={`
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center
          bg-[#25d366] hover:bg-[#1ebe5d] text-white transition-colors
          ring-4 ring-white/25
        `}
        aria-label="Chat on WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.i
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{    rotate: 90,  opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fas fa-times text-xl"
            />
          ) : (
            <motion.i
              key="wa"
              initial={{ rotate: 90,  opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{    rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fab fa-whatsapp text-2xl"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* pulse ring when closed */}
      {!open && (
        <span className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-[#25d366] opacity-30 animate-ping pointer-events-none" />
      )}
    </div>
  )
}

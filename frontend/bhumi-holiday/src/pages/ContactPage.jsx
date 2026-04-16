import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BRAND, waLink, WA_MSG_GENERAL, WA_MSG_INTERNATIONAL } from '../utils/constants'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

// ── Bank data ──────────────────────────────────────────────────────────────────
const BANKS = [
  {
    bank:    'ICICI BANK',
    logo:    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/120px-ICICI_Bank_Logo.svg.png',
    color:   'from-orange-500 to-red-600',
    bg:      'bg-orange-50 dark:bg-orange-900/20',
    border:  'border-orange-200 dark:border-orange-800',
    badge:   'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    name:    'BHUMI HOLIDAYS',
    type:    'CURRENT',
    account: '654805600649',
    ifsc:    'ICIC0006548',
    branch:  'Ahmedabad Railway Pura',
    upi:     'BHUMIHOLIDAYS@ICICI',
  },
  {
    bank:    'INDUSLND BANK',
    logo:    null,
    color:   'from-blue-600 to-indigo-700',
    bg:      'bg-blue-50 dark:bg-blue-900/20',
    border:  'border-blue-200 dark:border-blue-800',
    badge:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    name:    'BHUMI HOLIDAYS',
    type:    'CURRENT',
    account: '258980345600',
    ifsc:    'INDB0001031',
    branch:  'Kalupur, Ahmedabad',
    upi:     null,
  },
]

// ── FAQs ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How quickly will I get a response?', a: 'WhatsApp queries are answered within minutes during business hours. Email replies within 2–4 hours.' },
  { q: 'Can I book for a group of 10+ passengers?', a: 'Yes! We specialise in group bookings. WhatsApp us with the route and dates for a custom quote.' },
  { q: 'What is the Free 4% Coupon?', a: 'Sign up for a free account and we instantly generate a 4% flat discount coupon — valid on all domestic fares above ₹1,000.' },
  { q: 'Do you cover international flights?', a: 'Currently we focus on domestic Indian routes. For international bookings, please WhatsApp us directly and our team will assist you.' },
  { q: 'How do I get an invoice for my booking?', a: 'After booking via WhatsApp, our team emails a GST-compliant invoice within one business day.' },
]

// ── Copy-to-clipboard helper ───────────────────────────────────────────────────
function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      toast.success(`${label} copied!`)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [value, label])

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
      </div>
      <button
        onClick={copy}
        title={`Copy ${label}`}
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm
          ${copied
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 hover:bg-brand-100 hover:text-brand-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-400'
          }`}
      >
        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-xs`} />
      </button>
    </div>
  )
}

// ── Bank Card ─────────────────────────────────────────────────────────────────
function BankCard({ bank }) {
  return (
    <div className={`rounded-2xl border ${bank.border} ${bank.bg} overflow-hidden shadow-sm`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${bank.color} px-5 py-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-university text-white text-lg" />
        </div>
        <div>
          <p className="font-bold text-white text-base leading-tight">{bank.bank}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bank.badge}`}>{bank.type} A/C</span>
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 py-3">
        <CopyField label="Account Holder"  value={bank.name}    />
        <CopyField label="Account Number"  value={bank.account} />
        <CopyField label="IFSC Code"       value={bank.ifsc}    />
        <CopyField label="Branch"          value={bank.branch}  />
        {bank.upi && <CopyField label="UPI ID" value={bank.upi} />}
      </div>

      {/* NEFT/RTGS hint */}
      <div className="px-5 pb-4">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <i className="fas fa-info-circle text-brand-400" />
          NEFT · RTGS · IMPS accepted. Use account number for UPI transfers.
        </p>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ContactPage({ darkMode, setDarkMode }) {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors]   = useState({})
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => { const c = { ...er }; delete c[name]; return c })
  }

  const validateForm = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim())   e.phone   = 'Phone number is required'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validateForm()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    const text = encodeURIComponent(
      `*New Inquiry — Bhumi Holiday*\n\n` +
      `👤 *Name:* ${form.name}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📞 *Phone:* ${form.phone}\n` +
      `📌 *Subject:* ${form.subject || 'General'}\n\n` +
      `💬 *Message:*\n${form.message}`
    )
    setTimeout(() => {
      setSending(false)
      setSent(true)
      window.open(`https://wa.me/${BRAND.waNumber}?text=${text}`, '_blank')
    }, 600)
  }

  const inputCls = (key) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-700/60
     focus:outline-none focus:ring-2 transition-all
     ${errors[key]
       ? 'border-red-400 focus:ring-red-300 dark:border-red-600'
       : 'border-gray-200 dark:border-gray-600 focus:ring-brand-400 focus:border-transparent'
     }`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* ── Hero ── */}
      <div className="bg-hero pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
          <motion.div {...fadeUp()}>
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/25 mb-4">
              <i className="fas fa-headset" />We're here to help
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">Get In Touch</h1>
            <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
              Questions about flights, bookings, or payments? Reach us instantly via WhatsApp or fill the form below.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 flex-1 w-full">

        {/* ── Quick-contact cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: 'fa-whatsapp', fab: true,
              color: 'from-[#25d366] to-[#128c7e]',
              bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800',
              title: 'WhatsApp Us',
              desc: '+91 ' + BRAND.phone + ' · Fastest reply',
              cta: 'Chat Now →',
              href: waLink(WA_MSG_GENERAL),
            },
            {
              icon: 'fa-phone-alt', fab: false,
              color: 'from-brand-500 to-brand-700',
              bg: 'bg-brand-50 dark:bg-brand-900/20', border: 'border-brand-200 dark:border-brand-800',
              title: 'Call Us',
              desc: '+91 ' + BRAND.phone + ' · Mon–Sat 9AM–8PM',
              cta: 'Call Now →',
              href: BRAND.phoneTel,
            },
            {
              icon: 'fa-envelope', fab: false,
              color: 'from-purple-500 to-purple-700',
              bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800',
              title: 'Email Us',
              desc: BRAND.email,
              cta: 'Send Email →',
              href: BRAND.emailHref,
            },
          ].map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              {...fadeUp(i * 0.1)}
              className={`group flex flex-col items-center text-center gap-3 p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all ${card.bg} ${card.border}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <i className={`${card.fab ? 'fab' : 'fas'} ${card.icon} text-2xl text-white`} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-base">{card.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.desc}</p>
              </div>
              <span className={`text-xs font-bold px-4 py-1.5 rounded-full bg-gradient-to-r ${card.color} text-white mt-auto`}>
                {card.cta}
              </span>
            </motion.a>
          ))}
        </div>

        {/* ── International flight CTA ── */}
        <motion.a
          href={waLink(WA_MSG_INTERNATIONAL)}
          target="_blank" rel="noopener noreferrer"
          {...fadeUp(0.05)}
          className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-5 sm:px-8 py-4 mb-8 shadow-md hover:opacity-90 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-globe text-white text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base leading-tight">International Flights Inquiry</p>
            <p className="text-white/75 text-xs mt-0.5">Looking to fly abroad? Send us a direct WhatsApp message and we'll find the best options for you.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex-shrink-0 hover:bg-white/30 transition-all">
            <i className="fab fa-whatsapp text-[#25d366] text-lg" />Inquire Now
          </div>
        </motion.a>

        {/* ── Form + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">

          {/* Contact form */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full py-12 text-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <i className="fab fa-whatsapp text-4xl text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opened in WhatsApp!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Your inquiry has been opened in WhatsApp. Our team replies within minutes.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }); setErrors({}) }}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <i className="fas fa-paper-plane text-brand-500" />Send Us a Message
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">All fields are required. Message opens directly in WhatsApp.</p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" className={inputCls('name')} />
                      {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="fas fa-exclamation-circle text-[10px]" />{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" className={inputCls('email')} />
                      {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="fas fa-exclamation-circle text-[10px]" />{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 89803 45600" className={inputCls('phone')} />
                      {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="fas fa-exclamation-circle text-[10px]" />{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                      >
                        <option value="">Select topic…</option>
                        <option>Flight Booking</option>
                        <option>International Flights</option>
                        <option>Price Query</option>
                        <option>Coupon / Discount</option>
                        <option>Cancellation / Refund</option>
                        <option>Group Booking</option>
                        <option>Payment / Bank Transfer</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us your travel dates, route, number of passengers…" className={`${inputCls('message')} resize-none`} />
                    {errors.message && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><i className="fas fa-exclamation-circle text-[10px]" />{errors.message}</p>}
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3.5 py-2.5">
                      <i className="fas fa-exclamation-triangle text-red-500 text-sm flex-shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before sending.
                      </p>
                    </div>
                  )}

                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 shadow-md"
                  >
                    {sending
                      ? <><i className="fas fa-circle-notch fa-spin" />Sending…</>
                      : <><i className="fab fa-whatsapp text-lg" />Send via WhatsApp</>
                    }
                  </button>
                  <p className="text-center text-[11px] text-gray-400 -mt-1">
                    Your message opens in WhatsApp — no data stored on our servers.
                  </p>
                </form>
              </>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2 flex flex-col gap-5">
            {/* Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                  <i className="fas fa-clock text-brand-600 dark:text-brand-400 text-xs" />
                </span>
                Business Hours
              </h3>
              <div className="space-y-2.5 text-sm">
                {[['Monday – Friday','9:00 AM – 8:00 PM'],['Saturday','9:00 AM – 6:00 PM'],['Sunday','10:00 AM – 4:00 PM']].map(([d,h]) => (
                  <div key={d} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{d}</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{h}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">Typically reply within minutes on WhatsApp</span>
              </div>
            </div>

            {/* Contact quick links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <i className="fas fa-phone-alt text-purple-600 dark:text-purple-400 text-xs" />
                </span>
                Direct Contact
              </h3>
              <div className="space-y-3">
                <a href={BRAND.phoneTel} className="flex items-center gap-3 text-sm group">
                  <span className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-phone-alt text-brand-600 dark:text-brand-400 text-xs" />
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Call / WhatsApp</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{BRAND.phoneIntl}</p>
                  </div>
                </a>
                <a href={BRAND.emailHref} className="flex items-center gap-3 text-sm group">
                  <span className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <i className="fas fa-envelope text-purple-600 dark:text-purple-400 text-xs" />
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{BRAND.email}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-gradient-to-br from-[#25d366] to-[#075e54] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <i className="fab fa-whatsapp text-4xl opacity-90" />
                <div>
                  <p className="font-bold text-lg leading-tight">Book via WhatsApp</p>
                  <p className="text-white/75 text-xs">Instant confirmation · Best price</p>
                </div>
              </div>
              <p className="text-sm text-white/80 mb-4">Share your route and dates — we find the cheapest fare and confirm instantly.</p>
              <a
                href={waLink(WA_MSG_GENERAL)}
                target="_blank" rel="noopener noreferrer"
                className="block text-center bg-white text-[#075e54] font-bold text-sm py-2.5 rounded-xl hover:bg-white/90 transition-all"
              >
                <i className="fab fa-whatsapp mr-2" />Start Chat
              </a>
            </div>
          </motion.div>
        </div>

        {/* ── Bank Details ──────────────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.1)} id="bank-details" className="mb-14">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-bold px-4 py-1.5 rounded-full border border-brand-100 dark:border-brand-800 mb-3">
              <i className="fas fa-university" />Bank Transfer
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">Our Bank Details</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Transfer payment directly to our account. Tap the copy icon to copy any detail instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {BANKS.map((b) => <BankCard key={b.bank} bank={b} />)}
          </div>

          <div className="mt-6 max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Important</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                Always share your payment screenshot on WhatsApp after transferring.
                Bookings are confirmed only after payment verification by our team.
                Do not transfer to any other account — this is our only official bank information.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div {...fadeUp(0.1)}>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Can't find your answer? Just WhatsApp us.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <i className={`fas fa-chevron-down text-brand-500 text-xs flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div {...fadeUp(0.15)} className="mt-14 text-center">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg px-8 py-8 max-w-lg w-full">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="fas fa-plane-departure text-2xl text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Ready to fly?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Search live fares right now — no account needed.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/search"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-all shadow">
                <i className="fas fa-search" />Search Flights
              </Link>
              <Link to="/signup"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
                <i className="fas fa-gift" />Get Free Coupon
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
      <Footer />
    </div>
  )
}

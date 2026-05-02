import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toLocalDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CustomDatePicker({
  value,
  onChange,
  min,
  placeholder = 'Select date',
  className = '',
  compact = false,
}) {
  const selected = value ? toLocalDate(value) : null
  const minDate  = min   ? toLocalDate(min)   : null

  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = selected || minDate || new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [pos, setPos] = useState({ top: 200, left: 0, width: 280 })

  const triggerRef = useRef(null)
  const dropRef    = useRef(null)

  const calcPos = () => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 280) })
  }

  // Compute position synchronously before the calendar paints
  useLayoutEffect(() => {
    if (!open) return
    calcPos()
  }, [open])

  // Track scroll/resize while open
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const fn = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open])

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (selected) setView(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }, [value])

  const daysInMonth  = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const firstWeekDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay()
  const today        = new Date(); today.setHours(0, 0, 0, 0)

  const isDisabled = (day) => {
    if (!minDate) return false
    return new Date(view.getFullYear(), view.getMonth(), day) < minDate
  }

  const isSelected = (day) =>
    selected &&
    selected.getFullYear() === view.getFullYear() &&
    selected.getMonth()    === view.getMonth()    &&
    selected.getDate()     === day

  const isToday = (day) =>
    new Date(view.getFullYear(), view.getMonth(), day).toDateString() === today.toDateString()

  const handleSelect = (day) => {
    if (isDisabled(day)) return
    onChange(toDateString(new Date(view.getFullYear(), view.getMonth(), day)))
    setOpen(false)
  }

  const cells = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const triggerCls = compact
    ? 'w-full pl-8 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-xs focus:outline-none focus:border-brand-400 transition-all'
    : 'w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-sm font-medium focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200'

  const calendar = (
    <div
      ref={dropRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <i className="fas fa-chevron-left text-xs" />
        </button>
        <span className="text-sm font-bold text-gray-900 dark:text-white select-none">
          {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
        </span>
        <button type="button"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <i className="fas fa-chevron-right text-xs" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1 select-none">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleSelect(day)}
              disabled={isDisabled(day)}
              className={[
                'w-full aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-100',
                isDisabled(day)
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : isSelected(day)
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                  : isToday(day)
                  ? 'border-2 border-brand-400 text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {day}
            </button>
          )
        )}
      </div>

      {/* Today shortcut */}
      {(!minDate || today >= minDate) && (
        <button type="button"
          onClick={() => { onChange(toDateString(today)); setOpen(false) }}
          className="mt-2 w-full text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg py-1.5 transition-colors">
          Today
        </button>
      )}
    </div>
  )

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${triggerCls} flex items-center text-left ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className={`absolute ${compact ? 'left-3' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`}>
          <i className={`far fa-calendar-alt ${compact ? 'text-xs' : 'text-sm'}`} />
        </span>
        <span className="flex-1 truncate">
          {selected ? formatDisplay(selected) : placeholder}
        </span>
        <span className="ml-2 text-gray-400 text-xs pointer-events-none">
          <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} />
        </span>
      </button>

      {open && createPortal(calendar, document.body)}
    </div>
  )
}

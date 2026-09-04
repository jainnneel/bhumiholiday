import { BRAND } from './constants'

/**
 * Extracts flight numbers (e.g. "6E-123 → 6E-456") from the sectorKey.
 * Each segment looks like "6E-123-DEL-BOM"; falls back to 'N/A'.
 */
function getFlightNumbers(sectorKeys) {
  if (!sectorKeys || sectorKeys.length === 0) return 'N/A'

  const codes = sectorKeys[0].split('|').map((seg) => {
    const parts = seg.split('-')
    return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : null
  }).filter(Boolean)

  return codes.length ? codes.join(' → ') : 'N/A'
}

/**
 * Generates the WhatsApp booking inquiry message (domestic flight).
 *
 * @param {object} opts
 * @param {object}   opts.flight      – normalised flight object
 * @param {Array}    opts.passengers  – [{ first, last }]
 * @param {string}   opts.email
 * @param {string}   opts.mobile
 * @param {string}   opts.coupon
 * @param {string}   opts.company     – company name
 * @param {string}   opts.pan         – PAN card number
 * @param {string}   opts.gst         – GST number
 * @param {string}   opts.address     – billing address
 */
export function buildWhatsAppMessage({ flight, passengers, email, mobile, coupon, company, pan, gst, address }) {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  const formatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  const adults   = parseInt(flight.adult)    || 0
  const children = parseInt(flight.child)    || 0
  const infants  = parseInt(flight.infrants) || 0

  let paxLines = ''
  let pIdx = 0
  const addLines = (count, type) => {
    for (let i = 1; i <= count; i++) {
      paxLines += `${type} ${i}: ${passengers[pIdx].first} ${passengers[pIdx].last}\n`
      pIdx++
    }
  }
  addLines(adults,   'Adult')
  addLines(children, 'Child')
  addLines(infants,  'Infant')

  const couponDisplay = coupon && coupon.trim() ? coupon.trim() : 'None'

  const flightNumbers = getFlightNumbers(flight.sectorKey)

  return `
FLIGHT DETAILS
--------------------------------------
Airline: ${flight.flightName}
Flight No: ${flightNumbers}
Route: ${flight.fromc} → ${flight.toc}
Date: ${flight.date}
Departure: ${flight.fromTime}  |  Arrival: ${flight.toTime}
Duration: ${flight.duration}  |  Stops: ${flight.stops}

PRICING
--------------------------------------
Gross Price/Person: Rs.${Number(flight.perPerson).toLocaleString()}
Net Price/Person:   Rs.${Number(flight.dicPerPerson).toLocaleString()}
Total Net Price:    Rs.${Number(flight.dicPrice).toLocaleString()}
Coupon Code: ${couponDisplay}

CONTACT & BILLING DETAILS
--------------------------------------
Name/Company: ${company || 'N/A'}
Email: ${email}
Mobile: ${mobile}
Address: ${address || 'N/A'}
PAN Card: ${pan || 'N/A'}
GST Number: ${gst || 'N/A'}

PASSENGER DETAILS (${adults} Adult, ${children} Child, ${infants} Infant)
--------------------------------------
${paxLines}
Note: Fares quoted as of ${formatted}. Please confirm availability.`
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${BRAND.waNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

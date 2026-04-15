/**
 * Generates the WhatsApp booking inquiry message.
 * Matches exactly the format used in index.html.
 */

const WA_NUMBER = '917878392006'

export function buildWhatsAppMessage({ flight, passengers, email, mobile, coupon }) {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  const formatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  const adults   = parseInt(flight.adult)   || 0
  const children = parseInt(flight.child)   || 0
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

  return `Hi Bhumi Holiday! I would like to send a flight booking inquiry.

FLIGHT DETAILS
--------------------------------------
Airline: ${flight.flightName}
Route: ${flight.fromc} → ${flight.toc}
Date: ${flight.date}
Departure: ${flight.fromTime}  |  Arrival: ${flight.toTime}
Duration: ${flight.duration}  |  Stops: ${flight.stops}

PRICING
--------------------------------------
Gross Price/Person: Rs.${Number(flight.perPerson).toLocaleString()}
Net Price/Person:   Rs.${Number(flight.dicPerPerson).toLocaleString()}
Total Net Price:    Rs.${Number(flight.dicPrice).toLocaleString()}

CONTACT DETAILS
--------------------------------------
Email: ${email}
Mobile: ${mobile}
Coupon Code: ${couponDisplay}

PASSENGER DETAILS (${adults} Adult, ${children} Child, ${infants} Infant)
--------------------------------------
${paxLines}
Note: Fares quoted as of ${formatted}. Please confirm availability.`
}

export function openWhatsApp(message) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

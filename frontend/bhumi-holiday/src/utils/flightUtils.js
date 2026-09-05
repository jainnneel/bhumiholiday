/**
 * Utilities that mirror the logic from index.html
 */

/**
 * Null-safe uppercase. The API returns null for some fields — flightName is
 * null on codeshare/charter rows — so never call .toUpperCase() directly.
 */
const up = (value) => (value == null ? '' : String(value).toUpperCase())

/** Carrier code carried in the sector key, e.g. "S5" from "S5-424-AMD-DIU-...". */
export function getCarrierCode(sectorKeys) {
  if (!sectorKeys || sectorKeys.length === 0) return ''
  return sectorKeys[0].split('|')[0].split('-')[0] || ''
}

export function getAirlineInfo(flightName, sectorKeys) {
  if (!sectorKeys || sectorKeys.length === 0) return flightName || ''

  const segments  = sectorKeys[0].split('|')
  const flightCodes = segments.map((seg) => {
    const parts = seg.split('-')
    return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : null
  }).filter(Boolean)

  if (flightCodes.length === 0) return flightName || ''
  // Without this guard a null name renders literally as "null (S5-424 → ...)".
  const name = flightName || getCarrierCode(sectorKeys)
  const codes = flightCodes.join(' → ')
  return name ? `${name} (${codes})` : `(${codes})`
}

export function getRoutePath(sectorKeys) {
  if (!sectorKeys || sectorKeys.length === 0) return []

  const segments = sectorKeys[0].split('|')
  const codes = []
  segments.forEach((seg, i) => {
    const parts = seg.split('-')
    if (parts.length >= 4) {
      if (i === 0) codes.push(parts[2])
      codes.push(parts[3])
    }
  })
  return codes
}

/**
 * Actual origin / destination airports for a flight, read from the sector key.
 *
 * The API echoes the *searched* airport back in obj.from / obj.to, so a search
 * for Goa (GOX) labels every result GOX even when the flight really lands at
 * GOI — the two Goa airports are ~35 km apart. The sector key carries the true
 * per-segment airports ("6E-6345-AMD-GOI-1788691500"), so derive the endpoints
 * from it, falling back to the API's own values when it is missing or malformed.
 */
export function getActualEndpoints(sectorKeys, fallbackFrom, fallbackTo) {
  const path = getRoutePath(sectorKeys)
  return {
    from: path[0] || fallbackFrom,
    to:   path[path.length - 1] || fallbackTo,
  }
}

export function calculateDuration(fromTime, toTime) {
  if (!fromTime || !toTime) return 'N/A'
  const [fh, fm] = fromTime.split(':').map(Number)
  const [th, tm] = toTime.split(':').map(Number)
  if (isNaN(fh) || isNaN(th)) return 'N/A'

  let from = new Date()
  from.setHours(fh, fm, 0)
  let to = new Date()
  to.setHours(th, tm, 0)
  if (to < from) to.setDate(to.getDate() + 1)

  const diffMs   = to - from
  const diffHrs  = Math.floor(diffMs / 3600000)
  const diffMins = Math.round((diffMs % 3600000) / 60000)
  return `${diffHrs}h ${diffMins}m`
}

export function formatDisplayDate(dateStr) {
  // dateStr comes from backend as DD/MM/YYYY or similar
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`
  return dateStr
}

export function normaliseFlights(apiResults, from, to, adults, children) {
  return apiResults.map((obj, index) => {
    // Real airports for this itinerary — not the ones that were searched for.
    const actual = getActualEndpoints(obj.sectorKeys, obj.from, obj.to)
    // Some rows arrive with flightName null; fall back to the carrier code so
    // the card, the WhatsApp message and the e-ticket never print "null".
    const flightName = obj.flightName || getCarrierCode(obj.sectorKeys)

    return {
    rowId:           index,
    flightName,
    from,
    to,
    fromc:           actual.from,
    toc:             actual.to,
    date:            obj.date,
    formattedDate:   formatDisplayDate(obj.fromDate),
    time:            obj.fTime,
    duration:        obj.duration || calculateDuration(obj.fromTime, obj.toTime),
    adult:           adults,
    child:           children,
    infrants:        0,
    price:           obj.price,
    totalPrice:      obj.price,
    perPerson:       obj.perPerson,
    sectorKey:       obj.sectorKeys,
    stops:           obj.stops,
    fromTime:        obj.fromTime,
    toTime:          obj.toTime,
    dicPrice:        obj.discPrice,
    dicPerPerson:    obj.dicPerPerson,
    airlineInfo:     getAirlineInfo(flightName, obj.sectorKeys),
    routePath:       getRoutePath(obj.sectorKeys),
    hasPersonDiscount: obj.perPerson !== obj.dicPerPerson,
    hasTotalDiscount:  obj.price    !== obj.discPrice,
    seatLeft:        obj.seatLeft,
    }
  })
}

export function applyFlightFilters(flights, { airline, search, stops, minPrice, maxPrice }) {
  return flights.filter((f) => {
    if (airline && !up(f.airlineInfo).includes(up(airline))) return false
    if (search) {
      const q = up(search)
      const match =
        up(f.flightName).includes(q) ||
        up(f.from).includes(q) ||
        up(f.to).includes(q) ||
        up(f.airlineInfo).includes(q) ||
        up(f.fromTime).includes(q) ||
        up(f.toTime).includes(q) ||
        up(f.stops).includes(q) ||
        up(f.formattedDate).includes(q)
      if (!match) return false
    }
    if (stops !== 'All' && String(f.stops) !== String(stops)) return false
    const pp = parseFloat(f.perPerson) || 0
    if (pp < (minPrice || 0))      return false
    if (maxPrice && pp > maxPrice) return false
    return true
  })
}

/**
 * Utilities that mirror the logic from index.html
 */

export function getAirlineInfo(flightName, sectorKeys) {
  if (!sectorKeys || sectorKeys.length === 0) return flightName

  const segments  = sectorKeys[0].split('|')
  const flightCodes = segments.map((seg) => {
    const parts = seg.split('-')
    return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : null
  }).filter(Boolean)

  if (flightCodes.length === 0) return flightName
  return `${flightName} (${flightCodes.join(' → ')})`
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
  return apiResults.map((obj, index) => ({
    rowId:           index,
    flightName:      obj.flightName,
    from,
    to,
    fromc:           obj.from,
    toc:             obj.to,
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
    airlineInfo:     getAirlineInfo(obj.flightName, obj.sectorKeys),
    routePath:       getRoutePath(obj.sectorKeys),
    hasPersonDiscount: obj.perPerson !== obj.dicPerPerson,
    hasTotalDiscount:  obj.price    !== obj.discPrice,
    seatLeft:        obj.seatLeft,
  }))
}

export function applyFlightFilters(flights, { airline, search, stops, minPrice, maxPrice }) {
  return flights.filter((f) => {
    if (airline && !f.airlineInfo.toUpperCase().includes(airline.toUpperCase())) return false
    if (search) {
      const q = search.toUpperCase()
      const match =
        f.flightName.toUpperCase().includes(q) ||
        f.from.toUpperCase().includes(q) ||
        f.to.toUpperCase().includes(q) ||
        f.airlineInfo.toUpperCase().includes(q) ||
        f.fromTime.includes(q) ||
        f.toTime.includes(q) ||
        f.stops.toString().includes(q) ||
        (f.formattedDate || '').toUpperCase().includes(q)
      if (!match) return false
    }
    if (stops !== 'All' && String(f.stops) !== String(stops)) return false
    const pp = parseFloat(f.perPerson) || 0
    if (pp < (minPrice || 0))      return false
    if (maxPrice && pp > maxPrice) return false
    return true
  })
}

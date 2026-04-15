package com.test.coupen.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Adapts a NewCleartripResponse (new API model) into a Root1 (legacy internal model).
 *
 * This is the sole translation layer between the new API and the rest of the system.
 * FlightService, ResponseDto, and all price/discount logic are completely untouched.
 *
 * ── Structural mapping ────────────────────────────────────────────────────────────────
 *
 *  New API concept            │ Legacy model field
 *  ───────────────────────────┼────────────────────────────────────────────────────────
 *  fares (map entry)          │ Root                      one card per fare
 *  fare.fareId                │ Root.id, Fare.fk          booking key
 *  flightFare[*].flightId     │ Root.sectorKeys.get(0)    joined with "|"
 *    → split("|").length - 1  │ stops count               existing FlightService logic
 *  flights[id].airlineCode    │ Root.airlineCodes         distinct, ordered by segment
 *  sum(duration.hh*60+mm)     │ Root.totalDurationInMinutes
 *  perAdultPricing.totalPrice │ PricingInfo.ADT.totalPrice
 *  paxFare[CHD] components    │ PricingInfo.CHD.totalPrice
 *  paxFare[INF] components    │ PricingInfo.INF.totalPrice (falls back to CHD)
 *  departure.airport.time     │ FirstDeparture.time ("HH:mm"), .date ("DDMMYYYY")
 *  arrival.airport.time       │ LastArrival.time, .date
 *  identifiers.availableSeats │ Indicators.seatsLeft
 *
 * ── Date format note ─────────────────────────────────────────────────────────────────
 *  New API:  ISO-8601  "2026-04-04T21:00:00.000+05:30"
 *  Legacy:   date = "DDMMYYYY" e.g. "04042026"
 *            time = "HH:mm"    e.g. "21:00"
 *  FlightService then builds fromDate as: date[0:2]+"/"+date[2:4]+"/"+date[4:]
 *  → "04" + "/" + "04" + "/" + "2026" = "04/04/2026" ✓
 */
@Component
public class FlightResponseAdapter {

    /**
     * Entry point: converts a full new API response into Root1.
     * Returns an empty-roots Root1 (never null) on null/empty input
     * so FlightService's for-loop simply produces an empty result list.
     */
    public Root1 adapt(NewCleartripResponse response) {
        Root1 root1 = new Root1();
        root1.roots = new ArrayList<>();

        if (response == null || response.fares == null || response.fares.isEmpty()) {
            return root1;
        }

        Map<String, NewFlight> flightsMap = (response.flights != null)
                ? response.flights : Collections.emptyMap();

        for (NewFare fare : response.fares.values()) {
            Root root = buildRoot(fare, flightsMap);
            if (root != null) {
                root1.roots.add(root);
            }
        }

        return root1;
    }

    // ── Per-fare (Root) construction ──────────────────────────────────────────────────

    private Root buildRoot(NewFare fare, Map<String, NewFlight> flightsMap) {
        if (fare.subTravelOptionFare == null || fare.subTravelOptionFare.isEmpty()) return null;

        NewSubTravelOptionFare sto = fare.subTravelOptionFare.get(0);
        if (sto.flightFare == null || sto.flightFare.isEmpty()) return null;

        // Resolve flight segment objects in the order they appear in flightFare
        List<NewFlight> segments = new ArrayList<>();
        for (NewFlightFare ff : sto.flightFare) {
            NewFlight seg = flightsMap.get(ff.flightId);
            if (seg != null) segments.add(seg);
        }
        if (segments.isEmpty()) return null;

        Root root = new Root();

        root.id = (fare.fareId != null) ? fare.fareId : "";

        // ── sectorKeys ────────────────────────────────────────────────────────────
        // Join flightIds with "|". FlightService does:
        //   split("\\|").length == 1  → "Non stop"
        //   split("\\|").length - 1   → number of stops
        // e.g. "AI-2938-AMD-DEL-1234|AI-2439-DEL-BOM-5678" → 2 parts → 1 stop ✓
        String sectorKey = sto.flightFare.stream()
                .map(ff -> ff.flightId)
                .collect(Collectors.joining("|"));
        root.sectorKeys = new ArrayList<>(List.of(sectorKey));

        // ── airlineCodes ──────────────────────────────────────────────────────────
        // Distinct airline codes across segments, preserving encounter order.
        // FlightService uses get(0) to look up the display name from codeMap.
        root.airlineCodes = segments.stream()
                .map(seg -> (seg.airlineCode != null) ? seg.airlineCode : "XX")
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));

        // ── totalDurationInMinutes ────────────────────────────────────────────────
        // Use gate-to-gate time (lastArrival ISO − firstDeparture ISO).
        // This is the correct total trip time for both direct and connecting flights
        // because it naturally includes any layover time at transit airports.
        //
        // Example (connecting AMD→DEL→BOM):
        //   Departs AMD 08:25, Arrives BOM 20:25  →  720 min  ✓
        //   Summing segment durations (in-air only) gives ~255 min  ✗
        root.totalDurationInMinutes = computeTotalTripMinutes(
                segments.get(0),
                segments.get(segments.size() - 1),
                segments);

        // ── price breakup ─────────────────────────────────────────────────────────
        root.priceBreakup = buildPriceBreakup(fare, sto);

        // ── schedule ─────────────────────────────────────────────────────────────
        root.firstDeparture = buildFirstDeparture(segments.get(0));
        root.lastArrival    = buildLastArrival(segments.get(segments.size() - 1));

        // ── indicators ────────────────────────────────────────────────────────────
        root.indicators = buildIndicators(sto);

        return root;
    }

    // ── Pricing ──────────────────────────────────────────────────────────────────────

    private PriceBreakup buildPriceBreakup(NewFare fare, NewSubTravelOptionFare sto) {
        PriceBreakup priceBreakup = new PriceBreakup();
        Fare legacyFare = new Fare();

        // fk is the booking key. FlightService strips "#" from it if present.
        legacyFare.fk = (fare.fareId != null) ? fare.fareId : "";

        PricingInfo pricingInfo = new PricingInfo();

        // ADT: use the top-level perAdultPricing.totalPrice — most reliable for adults
        double adtPrice = (fare.pricing != null && fare.pricing.perAdultPricing != null)
                ? fare.pricing.perAdultPricing.totalPrice : 0.0;
        pricingInfo.ADT = buildPassengerType(adtPrice);

        // CHD / INF: parse from paxFare priceComponents (present when children/infants searched)
        // Falls back to 0.0 when not in the search (solo-adult search shows no CHD/INF data)
        Map<String, Double> paxPrices = computePerPersonPrices(sto);
        pricingInfo.CHD = buildPassengerType(paxPrices.getOrDefault("CHD", 0.0));

        // INF falls back to CHD price when absent — mirrors legacy behaviour:
        //   responseDto.setInfrantPerPerson(Double.valueOf(root.priceBreakup.fare.pricingInfo.CHD.totalPrice))
        pricingInfo.INF = buildPassengerType(
                paxPrices.getOrDefault("INF", paxPrices.getOrDefault("CHD", 0.0)));

        legacyFare.pricingInfo = pricingInfo;
        priceBreakup.fare = legacyFare;
        return priceBreakup;
    }

    /**
     * Computes per-person price for each passenger type from priceComponents.
     *
     * The new API gives total price for all paxCount passengers in each priceComponent,
     * so we sum all component amounts and divide by paxCount to get per-person.
     *
     * Example (ADT, paxCount=1): BF(11812) + YQ(798) + K3(648) + YR(340) + AIRLINE-MSC(1033)
     *   = 14631 per person — matches perAdultPricing.totalPrice ✓
     */
    private Map<String, Double> computePerPersonPrices(NewSubTravelOptionFare sto) {
        Map<String, Double> result = new HashMap<>();
        if (sto.paxFare == null) return result;

        for (NewPaxFare paxFare : sto.paxFare) {
            if (paxFare.paxType == null) continue;

            double totalForAllPax = (paxFare.priceComponents != null)
                    ? paxFare.priceComponents.stream().mapToDouble(c -> c.amount).sum()
                    : 0.0;

            // Guard against divide-by-zero; paxCount should always be >= 1 in real responses
            double perPerson = (paxFare.paxCount > 0)
                    ? totalForAllPax / paxFare.paxCount
                    : totalForAllPax;

            result.put(paxFare.paxType, perPerson);
        }
        return result;
    }

    /**
     * Converts a double price into the legacy PessangerType.
     *
     * PessangerType.totalPrice is Integer; new API uses double.
     * We use Math.round (not truncation) to avoid penny discrepancies.
     * FlightService reads this back as Double.valueOf(totalPrice), so the upcast is safe.
     */
    private PessangerType buildPassengerType(double price) {
        PessangerType p = new PessangerType();
        p.totalPrice = (int) Math.round(price);
        return p;
    }

    // ── Schedule (departure / arrival) ────────────────────────────────────────────────

    private FirstDeparture buildFirstDeparture(NewFlight flight) {
        FirstDeparture dep = new FirstDeparture();
        String iso = airportTime(flight, true);
        dep.time      = extractTime(iso);   // "21:00"
        dep.date      = extractDate(iso);   // "04042026"
        dep.timestamp = 0L;
        return dep;
    }

    private LastArrival buildLastArrival(NewFlight flight) {
        LastArrival arr = new LastArrival();
        String iso = airportTime(flight, false);
        arr.time      = extractTime(iso);
        arr.date      = extractDate(iso);
        arr.timestamp = 0L;
        return arr;
    }

    /**
     * Computes total trip duration in minutes — gate-to-gate including any layovers.
     *
     * Strategy: parse the ISO datetime of first departure and last arrival, then
     * take the difference. This is the only way to include layover time correctly.
     *
     * Fallback: if ISO parsing fails for any reason (null / unexpected format), fall
     * back to summing individual segment durations (in-air only, excludes layovers).
     * This keeps non-stop flights working even if the timestamp parse fails.
     *
     * Example — AMD 08:25 → DEL (layover) → BOM 20:25:
     *   ISO diff          = 720 min  → "12:00 hrs (1 stops)"  ✓  (correct gate-to-gate)
     *   segment-sum only  = 255 min  → "04:15 hrs (1 stops)"  ✗  (missing 7h 45m layover)
     */
    private int computeTotalTripMinutes(NewFlight firstSeg, NewFlight lastSeg,
                                        List<NewFlight> allSegments) {
        try {
            String depIso = airportTime(firstSeg, true);
            String arrIso = airportTime(lastSeg, false);

            if (depIso != null && arrIso != null) {
                // OffsetDateTime.parse() handles ISO-8601 with fractional seconds
                // e.g. "2026-04-04T08:25:00.000+05:30"
                OffsetDateTime dep = OffsetDateTime.parse(depIso);
                OffsetDateTime arr = OffsetDateTime.parse(arrIso);
                long minutes = Duration.between(dep, arr).toMinutes();
                if (minutes > 0) return (int) minutes;
            }
        } catch (Exception ignored) {
            // Fall through to segment-sum fallback below
        }

        // Fallback: sum of in-air durations only (no layover time)
        return allSegments.stream()
                .mapToInt(seg -> (seg.duration != null)
                        ? (seg.duration.hh * 60 + seg.duration.mm)
                        : 0)
                .sum();
    }

    /** Safely extracts the ISO time string from a flight's departure or arrival airport. */
    private String airportTime(NewFlight flight, boolean isDeparture) {
        try {
            NewEndpoint endpoint = isDeparture ? flight.departure : flight.arrival;
            return (endpoint != null && endpoint.airport != null) ? endpoint.airport.time : null;
        } catch (NullPointerException e) {
            return null;
        }
    }

    /**
     * Extracts HH:mm from ISO-8601 datetime.
     *   "2026-04-04T21:00:00.000+05:30"
     *    0123456789012345
     *              ^11  ^16
     */
    private String extractTime(String iso) {
        if (iso == null || iso.length() < 16) return "00:00";
        return iso.substring(11, 16);
    }

    /**
     * Extracts DDMMYYYY from ISO-8601 datetime.
     *   "2026-04-04T21:00:00.000+05:30"
     *    0123456789
     *    ^^^^  year(0-3)  month(5-6)  day(8-9)
     *
     * FlightService reads it as:
     *   date.substring(0,2) + "/" + date.substring(2,4) + "/" + date.substring(4)
     *   → "04" + "/" + "04" + "/" + "2026" = "04/04/2026" ✓
     */
    private String extractDate(String iso) {
        if (iso == null || iso.length() < 10) return "01012000";
        String year  = iso.substring(0, 4);   // "2026"
        String month = iso.substring(5, 7);   // "04"
        String day   = iso.substring(8, 10);  // "04"
        return day + month + year;            // "04042026"
    }

    // ── Indicators ────────────────────────────────────────────────────────────────────

    /**
     * Builds flight indicators.
     * Seats left is taken from the first flight segment's identifiers
     * (all segments in the same fare share the same availability constraint).
     */
    private Indicators buildIndicators(NewSubTravelOptionFare sto) {
        Indicators indicators = new Indicators();
        if (sto.flightFare != null && !sto.flightFare.isEmpty()) {
            NewFlightFare first = sto.flightFare.get(0);
            indicators.seatsLeft = (first.identifiers != null)
                    ? first.identifiers.availableSeatCount : 0;
        }
        return indicators;
    }
}

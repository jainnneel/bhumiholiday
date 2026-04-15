package com.test.coupen.service;

import java.util.List;
import java.util.Map;

/**
 * Response models for the new Cleartrip flight search API.
 *
 * These were reverse-engineered from the actual API response. Each class
 * maps directly to a JSON node in the response. Only the fields needed for
 * building a ResponseDto are included; unused fields are omitted to keep
 * deserialization fast and safe (Gson ignores unknown fields by default).
 *
 * DO NOT add business logic here. These are pure data carriers.
 */

/** Root wrapper for the entire new API response. */
class NewCleartripResponse {
    /**
     * Keyed by flight ID (e.g. "AI-2938-AMD-DEL-1775309100").
     * Contains individual flight segment details.
     */
    public Map<String, NewFlight> flights;

    /**
     * Keyed by fareId (the full fare key string).
     * Each entry represents one flight option card shown to the user.
     * A fare may reference 1 flight (non-stop) or N flights (connecting).
     */
    public Map<String, NewFare> fares;
}

/** A single flight segment (e.g. AMD → DEL). */
class NewFlight {
    public String id;
    public String airlineCode;          // e.g. "AI"
    public NewEndpoint departure;
    public NewEndpoint arrival;
    public NewDuration duration;        // segment duration (not total trip)
}

class NewEndpoint {
    public NewAirport airport;
}

class NewAirport {
    public String code;                 // IATA code, e.g. "AMD"
    /**
     * ISO-8601 local datetime: "2026-04-04T21:00:00.000+05:30"
     * Adapter parses this into legacy time ("HH:mm") and date ("DDMMYYYY").
     */
    public String time;
}

class NewDuration {
    public int hh;                      // hours component
    public int mm;                      // minutes component
}

/** One flight itinerary option — maps to a single legacy Root. */
class NewFare {
    /** Full fare key used for booking. Maps to Fare.fk in legacy model. */
    public String fareId;
    public String fareGroup;            // e.g. "REGULAR_FARE"
    public String brand;                // e.g. "ECO VALUE"
    public NewFarePricing pricing;
    /**
     * Ordered list of sub-journey fares. Index 0 = outbound journey.
     * Contains both per-passenger fare breakdown and ordered flight references.
     */
    public List<NewSubTravelOptionFare> subTravelOptionFare;
}

class NewFarePricing {
    /** Total price for ALL passengers combined. */
    public NewPricingDetail totalPricing;
    /**
     * Per-adult price. Primary source for ADT.totalPrice in legacy model.
     * Matches the per-person price used throughout FlightService calculations.
     */
    public NewPricingDetail perAdultPricing;
}

class NewPricingDetail {
    public double totalPrice;           // all-in fare (base + taxes)
    public double totalTax;
    public double totalBaseFare;
}

/** Per-journey fare breakdown (one entry per origin-destination pair). */
class NewSubTravelOptionFare {
    public String subTravelOptionKey;   // e.g. "AMD_BOM"
    /**
     * Per-passenger-type fare details.
     * Has one entry per pax type present in the search (ADT, CHD, INF).
     * Used to derive per-person prices for children/infants.
     */
    public List<NewPaxFare> paxFare;
    /**
     * Ordered list of flight segment references.
     * Order matters: index 0 = first segment, last index = final segment.
     * Count - 1 = number of connecting stops.
     */
    public List<NewFlightFare> flightFare;
}

/** Fare and price components for one passenger type. */
class NewPaxFare {
    public String paxType;              // "ADT", "CHD", or "INF"
    public int paxCount;                // number of passengers of this type
    /**
     * Individual price components (base fare + each tax separately).
     * Summing all amounts gives the per-passenger total for paxCount passengers.
     * Divide by paxCount to get the per-person price.
     */
    public List<NewPriceComponent> priceComponents;
}

/** A single price line item (one tax or the base fare). */
class NewPriceComponent {
    public String category;             // "BF" (base fare) or "TAX"
    public String code;                 // e.g. "YQ", "K3", "AIRLINE-MSC"
    public double amount;               // amount in INR
    public String currency;             // always "INR" for domestic
}

/** Reference to a flight segment within a fare, plus booking identifiers. */
class NewFlightFare {
    /** References a key in NewCleartripResponse.flights. */
    public String flightId;
    public NewFlightIdentifiers identifiers;
}

class NewFlightIdentifiers {
    public int availableSeatCount;      // Maps to Indicators.seatsLeft
    public String brandName;            // e.g. "ECO VALUE"
    public String cabinType;            // e.g. "ECONOMY"
    public String fareClass;            // e.g. "RP"
    public String fareBasisCode;        // e.g. "TU1YXFII"
}

package com.test.coupen.service;

import com.google.gson.Gson;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * HTTP client for the new Cleartrip flight search API.
 *
 * Responsibilities (only):
 *  1. Build the request URL from search parameters
 *  2. Execute the HTTP GET with required headers
 *  3. Deserialise the JSON body into NewCleartripResponse
 *
 * Nothing else — no business logic, no field mapping.
 * That belongs in FlightResponseAdapter.
 *
 * Configuration:
 *  Set `cleartrip.new.flight.api.url` in application.properties to the actual
 *  new endpoint URL. The URL format mirrors the old v2 search endpoint.
 */
@Component
public class NewApiClient {

    /**
     * New API base URL, injected from application.properties.
     * Update this value when the endpoint changes — no code changes needed.
     */
    @Value("${cleartrip.new.flight.api.url}")
    private String newApiBaseUrl;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final Gson gson = new Gson();

    /**
     * Fetches flight search results from the new API.
     *
     * @param fromCode   IATA code of origin, extracted from the request path (e.g. "AMD")
     * @param toCode     IATA code of destination (e.g. "BOM")
     * @param fromCity   City name of origin, spaces removed (e.g. "Ahmedabad")
     * @param toCity     City name of destination (e.g. "Mumbai")
     * @param date       Search date already formatted as "DD/MM/YYYY" (matches FlightService output)
     * @param adults     Number of adult passengers
     * @param children   Number of child passengers
     * @param infants    Number of infant passengers
     * @return Parsed NewCleartripResponse — never null; flights/fares maps may be null/empty
     * @throws IOException on HTTP errors or non-2xx response
     */
    public NewCleartripResponse fetchFlights(String fromCode, String toCode,
                                              String fromCity, String toCity,
                                              String date,
                                              int adults, int children, int infants) throws IOException {
        String url = buildUrl(fromCode, toCode, fromCity, toCity, date, adults, children, infants);

        Request request = new Request.Builder()
                .url(url)
                // ── Headers required by Cleartrip API ─────────────────────────────────
                .header("accept", "application/json")
                .header("accept-language", "en-IN,en;q=0.9,gu-IN;q=0.8,gu;q=0.7,hi-IN;q=0.6,hi;q=0.5")
                .header("app-agent", "DESKTOP")
                .header("cache-control", "no-cache")
                .header("pragma", "no-cache")
                .header("priority", "u=1, i")
                .header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
                .header("sec-ch-ua", "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"")
                .header("sec-ch-ua-mobile", "?0")
                .header("sec-ch-ua-platform", "\"Windows\"")
                .header("sec-fetch-dest", "empty")
                .header("sec-fetch-mode", "cors")
                .header("sec-fetch-site", "same-origin")
                .header("x-source-type", "Desktop")
                .header("x-client-id", "cleartrip")
                // ─────────────────────────────────────────────────────────────────────
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException(
                        "New flight API returned HTTP " + response.code() + " for: " + url);
            }
            if (response.body() == null) {
                // Empty body — return empty shell; adapter will produce an empty list
                return new NewCleartripResponse();
            }
            String body = response.body().string();
            return gson.fromJson(body, NewCleartripResponse.class);
        }
    }

    /**
     * Constructs the search URL.
     *
     * Parameters mirror the old v2 API so the same frontend/backend path params work.
     * If the new API requires different query param names or a POST body, update here only.
     */
    private String buildUrl(String fromCode, String toCode,
                            String fromCity, String toCity,
                            String date,
                            int adults, int children, int infants) {
        return newApiBaseUrl
                + "?adults=" + adults
                + "&childs=" + children
                + "&infants=" + infants
                + "&class=Economy"
                + "&from=" + fromCode
                + "&to=" + toCode
                + "&origin=" + fromCode + "%20-%20" + fromCity + ",%20IN"
                + "&destination=" + toCode + "%20-%20" + toCity + ",%20IN"
                + "&depart_date=" + date
                + "&intl=n"
                + "&sellingCountry=IN";
    }
}

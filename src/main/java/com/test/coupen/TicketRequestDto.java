package com.test.coupen;

import lombok.Data;
import java.util.List;

@Data
public class TicketRequestDto {
    private String flightName;
    private String flightLabel;
    private String route;
    private String date;
    private String time;
    private String arrivalTime;
    private String duration;
    private String fromCity;
    private String toCity;
    private String fromIata;
    private String toIata;
    private Double pricePerPerson;

    // Modal parameters
    private List<String> passengerNames;
    private int adults;
    private int children;
    private int infants;
    private String email;
    private boolean includeCompanyDetails;
    private boolean showPricingInformation;
    private Double discountAmount;
    private int totalPassengers;
    private String pnr;
    private String logoUrl;

    /** First non-blank name, for email greeting fallback */
    public String getPrimaryPassengerName() {
        if (passengerNames != null) {
            for (String n : passengerNames) {
                if (n != null && !n.isBlank()) return n;
            }
        }
        return "Valued Traveller";
    }
}

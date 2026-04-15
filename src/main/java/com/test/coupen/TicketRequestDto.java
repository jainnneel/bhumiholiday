package com.test.coupen;

import lombok.Data;

@Data
public class TicketRequestDto {
    private String flightName;
    private String flightLabel;
    private String route;
    private String date;
    private String time;
    private String duration;
    private Double pricePerPerson;

    // Modal parameters
    private String email;
    private boolean includeCompanyDetails;
    private boolean showPricingInformation;
    private Double discountAmount;
    private int totalPassengers;
}

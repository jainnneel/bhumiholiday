package com.test.coupen.dto;

import com.test.coupen.entity.FlightOffer;
import com.test.coupen.entity.OfferType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlightOfferResponse {

    private Long id;
    private String name;
    private OfferType offerType;
    private Boolean isActive;
    private Integer displayOrder;

    // Populated for PERCENTAGE type
    private Double percent;
    private Integer maxCap;
    private Integer convFeePerPax;

    // Populated for custom formula types (JSON string)
    private String formulaParams;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FlightOfferResponse from(FlightOffer offer) {
        FlightOfferResponse r = new FlightOfferResponse();
        r.setId(offer.getId());
        r.setName(offer.getName());
        r.setOfferType(offer.getOfferType());
        r.setIsActive(offer.getIsActive());
        r.setDisplayOrder(offer.getDisplayOrder());
        r.setPercent(offer.getPercent());
        r.setMaxCap(offer.getMaxCap());
        r.setConvFeePerPax(offer.getConvFeePerPax());
        r.setFormulaParams(offer.getFormulaParams());
        r.setCreatedAt(offer.getCreatedAt());
        r.setUpdatedAt(offer.getUpdatedAt());
        return r;
    }
}

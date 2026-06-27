package com.test.coupen.dto;

import com.test.coupen.entity.OfferType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FlightOfferRequest {

    @NotBlank(message = "Offer name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    private String name;

    @NotNull(message = "Offer type is required")
    private OfferType offerType;

    private Boolean isActive = true;

    private Integer displayOrder = 0;

    // Used when offerType = PERCENTAGE
    @DecimalMin(value = "0.0", inclusive = false, message = "Percent must be > 0")
    @DecimalMax(value = "1.0", message = "Percent must be <= 1.0 (use 0.12 for 12%)")
    private Double percent;

    @Min(value = 0, message = "Max cap must be non-negative")
    private Integer maxCap;

    @Min(value = 0, message = "Convenience fee must be non-negative")
    private Integer convFeePerPax;

    // JSON string for custom formula types; content validated per offerType in service
    private String formulaParams;
}

package com.test.coupen.entity;

public enum OfferType {
    // percent, maxCap, convFeePerPax stored directly on entity
    PERCENTAGE,

    // formulaParams: {"baseFeePerPax":315, "percentRate":0.05, "convFeePerPax":0}
    BASE_FEE_PLUS_PERCENT,

    // formulaParams: {"flatDiscount":250, "percentRate":0.12, "percentCap":2000, "convFeePerPax":420}
    FLAT_PLUS_PERCENT,

    // formulaParams: {"threshold":3250, "flatDiscount":805, "convFeePerPax":420}
    CONDITIONAL_FLAT,

    // formulaParams: {"percentRate":0.06, "percentCap":9000, "convFeeFlat":400}
    PERCENT_FLAT_CONV
}

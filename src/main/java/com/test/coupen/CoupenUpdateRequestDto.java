package com.test.coupen;

import com.test.coupen.entity.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CoupenUpdateRequestDto {

    @NotBlank
    private String coupenCode;

    @NotNull
    private DiscountType discountType;

    private List<RangeDto> rangeDiscounts;

    private Double fixPercentage;

    private Integer maxDiscount;

    private Integer minAmount;

    public Integer getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(Integer maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public Integer getMinAmount() {
        return minAmount;
    }

    public void setMinAmount(Integer minAmount) {
        this.minAmount = minAmount;
    }

    public String getCoupenCode() {
        return coupenCode;
    }

    public void setCoupenCode(String coupenCode) {
        this.coupenCode = coupenCode;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public List<RangeDto> getRangeDiscounts() {
        return rangeDiscounts;
    }

    public void setRangeDiscounts(List<RangeDto> rangeDiscounts) {
        this.rangeDiscounts = rangeDiscounts;
    }

    public Double getFixPercentage() {
        return fixPercentage;
    }

    public void setFixPercentage(Double fixPercentage) {
        this.fixPercentage = fixPercentage;
    }

    public static class RangeDto {

        private Long id;

        private Long from;

        private Long to;

        private Long value;

        public RangeDto(Long id, Long from, Long to, Long value) {
            this.id = id;
            this.from = from;
            this.to = to;
            this.value = value;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getFrom() {
            return from;
        }

        public void setFrom(Long from) {
            this.from = from;
        }

        public Long getTo() {
            return to;
        }

        public void setTo(Long to) {
            this.to = to;
        }

        public Long getValue() {
            return value;
        }

        public void setValue(Long value) {
            this.value = value;
        }
    }
}

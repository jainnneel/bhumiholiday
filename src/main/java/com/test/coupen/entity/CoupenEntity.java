package com.test.coupen.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class CoupenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coupenId;

    @Column(nullable = false, unique = true)
    private String coupenCode;

    @Column(nullable = false)
    private DiscountType discountType;

    @OneToMany(mappedBy = "coupen", fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<RangeEntity> rangeDiscounts;

    private Double fixPercentage;

    private Integer maxDiscount;

    private Integer minAmount;

    private Integer convenanceFee;

    public Integer getConvenanceFee() {
        return convenanceFee;
    }

    public void setConvenanceFee(Integer convenanceFee) {
        this.convenanceFee = convenanceFee;
    }

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

    public Long getCoupenId() {
        return coupenId;
    }

    public void setCoupenId(Long coupenId) {
        this.coupenId = coupenId;
    }

    public String getCoupenCode() {
        return coupenCode.toLowerCase();
    }

    public void setCoupenCode(String coupenCode) {
        this.coupenCode = coupenCode.toLowerCase();
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public List<RangeEntity> getRangeDiscounts() {
        return rangeDiscounts;
    }

    public void setRangeDiscounts(List<RangeEntity> rangeDiscounts) {
        this.rangeDiscounts = rangeDiscounts;
    }

    public Double getFixPercentage() {
        return fixPercentage;
    }

    public void setFixPercentage(Double fixPercentage) {
        this.fixPercentage = fixPercentage;
    }
}

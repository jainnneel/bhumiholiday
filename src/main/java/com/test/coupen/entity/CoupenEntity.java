package com.test.coupen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.jetbrains.annotations.NotNull;

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

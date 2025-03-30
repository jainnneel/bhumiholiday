package com.test.coupen.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
public class RangeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long from_price;

    private Long to_price;

    private Long value;

    @ManyToOne
    @JsonBackReference
    private CoupenEntity coupen;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFrom() {
        return from_price;
    }

    public void setFrom(Long from) {
        this.from_price = from;
    }

    public Long getTo() {
        return to_price;
    }

    public void setTo(Long to) {
        this.to_price = to;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
    }

    public CoupenEntity getCoupen() {
        return coupen;
    }

    public void setCoupen(CoupenEntity coupen) {
        this.coupen = coupen;
    }
}

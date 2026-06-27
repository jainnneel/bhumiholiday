package com.test.coupen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "flight_offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "offer_type", nullable = false, length = 30)
    private OfferType offerType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // PERCENTAGE type fields
    private Double percent;

    @Column(name = "max_cap")
    private Integer maxCap;

    @Column(name = "conv_fee_per_pax")
    private Integer convFeePerPax;

    // Stores JSON params for custom formula types
    @Column(name = "formula_params", columnDefinition = "TEXT")
    private String formulaParams;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

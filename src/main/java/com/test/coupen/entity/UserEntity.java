package com.test.coupen.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users_bhumi")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String company;

    /** PAN card number (mandatory at signup, stored for GST invoicing) */
    @Column(length = 10)
    private String pan;

    /** GST registration number */
    @Column(length = 15)
    private String gst;

    /** Billing address */
    @Column(columnDefinition = "TEXT")
    private String address;

    /** Stores the coupon code generated for this user on signup */
    private String coupenCode;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email != null ? email.toLowerCase().trim() : null; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan != null ? pan.toUpperCase().trim() : null; }

    public String getGst() { return gst; }
    public void setGst(String gst) { this.gst = gst != null ? gst.toUpperCase().trim() : null; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCoupenCode() { return coupenCode; }
    public void setCoupenCode(String coupenCode) { this.coupenCode = coupenCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

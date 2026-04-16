package com.test.coupen.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Company / full name is required")
    private String company;

    @NotBlank(message = "PAN card number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN format (e.g. ABCDE1234F)")
    @Size(min = 10, max = 10, message = "PAN must be exactly 10 characters")
    private String pan;

    @NotBlank(message = "GST number is required")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
             message = "Invalid GST format (15-character GSTIN)")
    @Size(min = 15, max = 15, message = "GST must be exactly 15 characters")
    private String gst;

    @NotBlank(message = "Billing address is required")
    private String address;

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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
}

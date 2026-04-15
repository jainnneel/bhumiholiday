package com.test.coupen.auth;

import com.test.coupen.entity.CoupenEntity;

public class AuthResponse {

    private boolean success;
    private String message;

    // user fields
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;

    // coupon (populated after signup)
    private CoupenEntity coupon;

    // ── Static factory methods ─────────────────────────────────────────────────

    public static AuthResponse ok(String message) {
        AuthResponse r = new AuthResponse();
        r.success = true;
        r.message = message;
        return r;
    }

    public static AuthResponse error(String message) {
        AuthResponse r = new AuthResponse();
        r.success = false;
        r.message = message;
        return r;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

    public CoupenEntity getCoupon() { return coupon; }
    public void setCoupon(CoupenEntity coupon) { this.coupon = coupon; }
}

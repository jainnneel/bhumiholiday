package com.test.coupen.auth;

import com.test.coupen.entity.CoupenEntity;

/**
 * Returned by GET /user/profile?email=...
 * Includes the user's details and their associated coupon (if any).
 */
public class UserProfileResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;
    private String pan;
    private String gst;
    private String address;

    /** The coupon linked to this user — null if none assigned yet */
    private CoupenEntity coupon;

    // ── Static factory ─────────────────────────────────────────────────────────

    public static UserProfileResponse from(com.test.coupen.entity.UserEntity user,
                                           CoupenEntity coupon) {
        UserProfileResponse r = new UserProfileResponse();
        r.userId    = user.getId();
        r.firstName = user.getFirstName();
        r.lastName  = user.getLastName();
        r.email     = user.getEmail();
        r.phone     = user.getPhone();
        r.company   = user.getCompany();
        r.pan       = user.getPan();
        r.gst       = user.getGst();
        r.address   = user.getAddress();
        r.coupon    = coupon;
        return r;
    }

    // ── Getters & Setters ──────────────────────────────────────────────────────

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

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getGst() { return gst; }
    public void setGst(String gst) { this.gst = gst; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public CoupenEntity getCoupon() { return coupon; }
    public void setCoupon(CoupenEntity coupon) { this.coupon = coupon; }
}

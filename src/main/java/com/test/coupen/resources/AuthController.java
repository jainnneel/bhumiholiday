package com.test.coupen.resources;

import com.test.coupen.auth.AuthResponse;
import com.test.coupen.auth.SendOtpRequest;
import com.test.coupen.auth.SignupRequest;
import com.test.coupen.auth.VerifyOtpRequest;
import com.test.coupen.service.AuthService;
import jakarta.validation.Valid;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ── POST /auth/send-otp ────────────────────────────────────────────────────
    /**
     * Generates a 6-digit OTP, stores it in the DB, and sends it to the user's
     * email (if JavaMailSender is configured). In development the OTP is also
     * returned in the response body so the frontend can surface it in a toast.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(
            @RequestBody @Valid SendOtpRequest request) {
        try {
            String otp = authService.sendOtp(request.getEmail());

            // Return the OTP in dev so the frontend can show "[DEV] OTP: xxxxxx"
            // In production you would omit the `otp` field.
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent to " + request.getEmail(),
                "otp",     otp          // Remove this line before going to production!
            ));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", ex.getMessage() != null ? ex.getMessage() : "Failed to send OTP"
            ));
        }
    }

    // ── POST /auth/verify-otp ──────────────────────────────────────────────────
    /**
     * Validates the OTP. On success the frontend may proceed to the signup or
     * login step. The OTP is marked as used so it cannot be replayed.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestBody @Valid VerifyOtpRequest request) {
        try {
            authService.verifyOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP verified successfully"
            ));
        } catch (BadRequestException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Verification failed. Please try again."
            ));
        }
    }

    // ── POST /auth/signup ──────────────────────────────────────────────────────
    /**
     * Creates the user account and auto-generates a personal FLAT 4% coupon.
     * The coupon object is returned in the response so the frontend can store it
     * in context and show the CouponSuccess page.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody @Valid SignupRequest request) {
        try {
            AuthResponse resp = authService.signup(request);
            return ResponseEntity.ok(resp);
        } catch (BadRequestException ex) {
            return ResponseEntity.badRequest().body(AuthResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                .body(AuthResponse.error("Signup failed. Please try again."));
        }
    }
}

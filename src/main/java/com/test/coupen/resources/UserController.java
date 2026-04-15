package com.test.coupen.resources;

import com.test.coupen.auth.UserProfileResponse;
import com.test.coupen.entity.CoupenEntity;
import com.test.coupen.entity.UserEntity;
import com.test.coupen.repository.UserRepository;
import com.test.coupen.service.CoupenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoupenService coupenService;

    // ── GET /user/profile?email=... ────────────────────────────────────────────
    /**
     * Returns the user's profile including their assigned coupon.
     * Used by the frontend after login to hydrate auth context.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Email is required"));
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                .body(Map.of("success", false, "message", "User not found"));
        }

        UserEntity user = userOpt.get();

        // Look up the coupon associated with this user
        CoupenEntity coupon = null;
        if (user.getCoupenCode() != null && !user.getCoupenCode().isBlank()) {
            coupon = coupenService.getCoupenByCoupenCode(user.getCoupenCode()).orElse(null);
        }

        return ResponseEntity.ok(UserProfileResponse.from(user, coupon));
    }

    // ── GET /user/coupon?email=... ─────────────────────────────────────────────
    /**
     * Returns just the coupon for a user — used by the frontend coupon auto-fetch.
     */
    @GetMapping("/coupon")
    public ResponseEntity<?> getUserCoupon(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Email is required"));
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404)
                .body(Map.of("success", false, "message", "User not found"));
        }

        UserEntity user = userOpt.get();
        if (user.getCoupenCode() == null || user.getCoupenCode().isBlank()) {
            return ResponseEntity.status(404)
                .body(Map.of("success", false, "message", "No coupon assigned to this user"));
        }

        CoupenEntity coupon = coupenService.getCoupenByCoupenCode(user.getCoupenCode()).orElse(null);
        if (coupon == null) {
            return ResponseEntity.status(404)
                .body(Map.of("success", false, "message", "Coupon not found"));
        }

        return ResponseEntity.ok(coupon);
    }
}

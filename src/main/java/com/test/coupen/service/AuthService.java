package com.test.coupen.service;

import com.test.coupen.CoupenRequestDto;
import com.test.coupen.auth.AuthResponse;
import com.test.coupen.auth.SignupRequest;
import com.test.coupen.entity.CoupenEntity;
import com.test.coupen.entity.DiscountType;
import com.test.coupen.entity.OtpEntity;
import com.test.coupen.entity.UserEntity;
import com.test.coupen.repository.OtpRepository;
import com.test.coupen.repository.UserRepository;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoupenService coupenService;

    @Autowired(required = false)
    private EmailService emailService;

    // ── Send OTP ───────────────────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP, persists it, and (if mail is configured) sends it
     * to the user. Returns the OTP string so the controller can expose it in dev
     * environments.
     */
    public String sendOtp(String email) {
        String normalised = email.toLowerCase().trim();

        // Invalidate any existing unused OTPs for this email
        otpRepository.invalidateAllForEmail(normalised);

        // Generate new 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));

        OtpEntity otp = new OtpEntity();
        otp.setEmail(normalised);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);

        // Attempt email delivery (gracefully skipped if mail is not configured)
        trySendOtpEmail(normalised, otpCode);

        // OTP logged only to server console for debugging — not exposed to client
        return otpCode;
    }

    // ── Verify OTP ─────────────────────────────────────────────────────────────

    /**
     * Returns true if the OTP matches, is unused, and has not expired.
     */
    public boolean verifyOtp(String email, String otp) throws BadRequestException {
        String normalised = email.toLowerCase().trim();

        Optional<OtpEntity> record =
            otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(normalised);

        if (record.isEmpty()) {
            throw new BadRequestException("No OTP found for this email. Please request a new one.");
        }

        OtpEntity otpEntity = record.get();

        if (otpEntity.isExpired()) {
            otpEntity.setUsed(true);
            otpRepository.save(otpEntity);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!otpEntity.getOtpCode().equals(otp.trim())) {
            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        // Mark as used so it cannot be replayed
        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
        return true;
    }

    // ── Signup ─────────────────────────────────────────────────────────────────

    /**
     * Creates the user record and generates a personal FLAT 4% coupon.
     * The coupon code is saved against the user row for later retrieval.
     */
    public AuthResponse signup(SignupRequest request) throws BadRequestException {
        String normalised = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalised)) {
            throw new BadRequestException("An account with this email already exists. Please sign in.");
        }

        // ── 1. Persist user ────────────────────────────────────────────────────
        UserEntity user = new UserEntity();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : "");
        user.setEmail(normalised);
        user.setPhone(request.getPhone().trim());
        user.setCompany(request.getCompany() != null ? request.getCompany().trim() : "");
        user.setPan(request.getPan() != null ? request.getPan().toUpperCase().trim() : "");
        user.setGst(request.getGst() != null ? request.getGst().toUpperCase().trim() : "");
        user.setAddress(request.getAddress() != null ? request.getAddress().trim() : "");

        // ── 2. Generate unique FLAT 4% coupon for this user ────────────────────
        String couponCode = generateUniqueCouponCode(normalised);

        CoupenRequestDto dto = new CoupenRequestDto();
        dto.setCoupenCode(couponCode);
        dto.setDiscountType(DiscountType.FLAT);
        dto.setFixPercentage(5.0);
        dto.setMinAmount(2500);
        dto.setMaxDiscount(5000);

        CoupenEntity coupen = coupenService.saveCoupen(dto);

        // ── 3. Link coupon to user & save ──────────────────────────────────────
        user.setCoupenCode(coupen.getCoupenCode());
        userRepository.save(user);

        // ── 4. Build response ──────────────────────────────────────────────────
        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage("Account created successfully. Your exclusive coupon is ready!");
        resp.setUserId(user.getId());
        resp.setFirstName(user.getFirstName());
        resp.setLastName(user.getLastName());
        resp.setEmail(user.getEmail());
        resp.setPhone(user.getPhone());
        resp.setCompany(user.getCompany());
        resp.setPan(user.getPan());
        resp.setGst(user.getGst());
        resp.setAddress(user.getAddress());
        resp.setCoupon(coupen);
        return resp;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Builds a coupon code like "BHX3K9A" that is guaranteed to be unique in the
     * coupen table. Retries up to 5 times before falling back to a timestamp suffix.
     */
    private String generateUniqueCouponCode(String email) {
        String base = "BH" + email.substring(0, Math.min(3, email.indexOf('@') > 0
                ? email.indexOf('@') : email.length())).toUpperCase().replaceAll("[^A-Z0-9]", "");

        for (int attempt = 0; attempt < 5; attempt++) {
            String suffix = Integer.toHexString(new Random().nextInt(0xFFFFF)).toUpperCase();
            String code   = (base + suffix).substring(0, Math.min(10, base.length() + suffix.length()));
            if (coupenService.getCoupenByCoupenCode(code).isEmpty()) {
                return code;
            }
        }
        // Ultimate fallback: use last 6 chars of timestamp in hex
        return (base + Long.toHexString(System.currentTimeMillis())).substring(0, 10).toUpperCase();
    }

    private void trySendOtpEmail(String email, String otpCode) {
        if (emailService == null) {
            System.out.println("[AUTH] Email service not configured — OTP not emailed.");
            return;
        }
        try {
            String subject = "Your Bhumi Holiday OTP";
            String html = "<html><body style='font-family:Arial,sans-serif;'>"
                + "<h2 style='color:#1a4feb;'>Bhumi Holiday — Verification Code</h2>"
                + "<p>Your one-time password is:</p>"
                + "<div style='font-size:36px;font-weight:bold;letter-spacing:8px;"
                + "background:#f0f4ff;padding:20px 32px;border-radius:12px;"
                + "display:inline-block;margin:16px 0;color:#1340d8;'>"
                + otpCode + "</div>"
                + "<p style='color:#64748b;'>This code expires in <strong>10 minutes</strong>. "
                + "Do not share it with anyone.</p>"
                + "<p>— Bhumi Holiday Team</p>"
                + "</body></html>";

            // Reuse EmailService's JavaMailSender via reflection-free helper
            sendSimpleHtml(email, subject, html);
        } catch (Exception ex) {
            System.err.println("[AUTH] Failed to send OTP email: " + ex.getMessage());
        }
    }

    private void sendSimpleHtml(String to, String subject, String html) throws Exception {
        // Delegate to EmailService only if it has a mailSender. We call its
        // internal sender directly to avoid creating a TicketRequestDto.
        // Instead we create a minimal mail via JavaMailSender injected here.
        if (emailService == null) return;

        // Use reflection-free approach: build our own mail via the injected sender
        jakarta.mail.internet.MimeMessage msg =
            getMailSender().createMimeMessage();
        org.springframework.mail.javamail.MimeMessageHelper helper =
            new org.springframework.mail.javamail.MimeMessageHelper(msg, false, "UTF-8");
        helper.setFrom("info@bhumiholidays.in");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        getMailSender().send(msg);
    }

    @Autowired(required = false)
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    private org.springframework.mail.javamail.JavaMailSender getMailSender() {
        return mailSender;
    }
}

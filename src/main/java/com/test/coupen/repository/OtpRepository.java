package com.test.coupen.repository;

import com.test.coupen.entity.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Long> {

    /** Get the most recent unused OTP for an email */
    Optional<OtpEntity> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    /** Invalidate all previous OTPs for an email before issuing a new one */
    @Modifying
    @Transactional
    @Query("UPDATE OtpEntity o SET o.used = true WHERE o.email = :email AND o.used = false")
    void invalidateAllForEmail(String email);
}

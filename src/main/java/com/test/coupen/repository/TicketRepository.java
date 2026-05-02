package com.test.coupen.repository;

import com.test.coupen.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
    List<TicketEntity> findByEmailOrderByTicketGeneratedAtDesc(String email);
}

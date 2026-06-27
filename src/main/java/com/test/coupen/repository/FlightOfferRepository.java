package com.test.coupen.repository;

import com.test.coupen.entity.FlightOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlightOfferRepository extends JpaRepository<FlightOffer, Long> {

    List<FlightOffer> findByIsActiveTrueOrderByDisplayOrderAscNameAsc();
}

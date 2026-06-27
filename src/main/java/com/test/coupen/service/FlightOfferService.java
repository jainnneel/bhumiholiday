package com.test.coupen.service;

import com.test.coupen.dto.FlightOfferRequest;
import com.test.coupen.dto.FlightOfferResponse;
import com.test.coupen.entity.FlightOffer;
import com.test.coupen.entity.OfferType;
import com.test.coupen.repository.FlightOfferRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightOfferService {

    private final FlightOfferRepository repository;

    public List<FlightOfferResponse> getAll() {
        return repository.findAll().stream()
                .map(FlightOfferResponse::from)
                .collect(Collectors.toList());
    }

    public List<FlightOfferResponse> getActive() {
        return repository.findByIsActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(FlightOfferResponse::from)
                .collect(Collectors.toList());
    }

    public FlightOfferResponse getById(Long id) {
        return FlightOfferResponse.from(findOrThrow(id));
    }

    @Transactional
    public FlightOfferResponse create(FlightOfferRequest request) {
        validateFormulaFields(request);
        FlightOffer offer = new FlightOffer();
        mapToEntity(request, offer);
        FlightOffer saved = repository.save(offer);
        log.info("Created flight offer id={} name={}", saved.getId(), saved.getName());
        return FlightOfferResponse.from(saved);
    }

    @Transactional
    public FlightOfferResponse update(Long id, FlightOfferRequest request) {
        validateFormulaFields(request);
        FlightOffer offer = findOrThrow(id);
        mapToEntity(request, offer);
        FlightOffer saved = repository.save(offer);
        log.info("Updated flight offer id={} name={}", saved.getId(), saved.getName());
        return FlightOfferResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        FlightOffer offer = findOrThrow(id);
        repository.delete(offer);
        log.info("Deleted flight offer id={} name={}", id, offer.getName());
    }

    @Transactional
    public FlightOfferResponse toggleActive(Long id) {
        FlightOffer offer = findOrThrow(id);
        offer.setIsActive(!offer.getIsActive());
        FlightOffer saved = repository.save(offer);
        log.info("Toggled flight offer id={} isActive={}", id, saved.getIsActive());
        return FlightOfferResponse.from(saved);
    }

    private FlightOffer findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight offer not found: " + id));
    }

    private void mapToEntity(FlightOfferRequest req, FlightOffer offer) {
        offer.setName(req.getName().trim());
        offer.setOfferType(req.getOfferType());
        offer.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
        offer.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        offer.setPercent(req.getPercent());
        offer.setMaxCap(req.getMaxCap());
        offer.setConvFeePerPax(req.getConvFeePerPax());
        offer.setFormulaParams(req.getFormulaParams());
    }

    private void validateFormulaFields(FlightOfferRequest req) {
        if (req.getOfferType() == OfferType.PERCENTAGE) {
            if (req.getPercent() == null || req.getMaxCap() == null || req.getConvFeePerPax() == null) {
                throw new IllegalArgumentException("PERCENTAGE type requires percent, maxCap, and convFeePerPax");
            }
        } else {
            if (req.getFormulaParams() == null || req.getFormulaParams().isBlank()) {
                throw new IllegalArgumentException("Custom formula types require formulaParams JSON");
            }
        }
    }
}

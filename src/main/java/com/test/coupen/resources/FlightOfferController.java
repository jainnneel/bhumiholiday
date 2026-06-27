package com.test.coupen.resources;

import com.test.coupen.dto.FlightOfferRequest;
import com.test.coupen.dto.FlightOfferResponse;
import com.test.coupen.service.FlightOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flight-offers")
@RequiredArgsConstructor
public class FlightOfferController {

    private final FlightOfferService service;

    @GetMapping
    public ResponseEntity<List<FlightOfferResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<FlightOfferResponse>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightOfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<FlightOfferResponse> create(@Valid @RequestBody FlightOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightOfferResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FlightOfferRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<FlightOfferResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }
}

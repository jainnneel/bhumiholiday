package com.test.coupen.resources;

import com.test.coupen.TicketRequestDto;
import com.test.coupen.dto.TicketSummaryDto;
import com.test.coupen.entity.TicketEntity;
import com.test.coupen.repository.TicketRepository;
import com.test.coupen.service.EmailService;
import com.test.coupen.service.PdfGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ticket")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TicketRepository ticketRepository;

    @PostMapping("/email")
    public ResponseEntity<String> emailTicket(@RequestBody TicketRequestDto request) {
        try {
            String pnr = request.getPnr();
            byte[] pdfBytes = pdfGeneratorService.generateTicketPdf(request, pnr);

            saveTicket(request, pnr, pdfBytes);
            emailService.sendTicketEmail(request.getEmail(), pdfBytes, request, pnr);

            return ResponseEntity.ok("{\"message\": \"Email sent successfully\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Failed to process ticket email\"}");
        }
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadTicket(@RequestBody TicketRequestDto request) {
        try {
            String pnr = request.getPnr();
            byte[] pdfBytes = pdfGeneratorService.generateTicketPdf(request, pnr);

            saveTicket(request, pnr, pdfBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=E-Ticket_" + pnr + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<TicketSummaryDto>> getUserTickets(@RequestParam String email) {
        List<TicketEntity> tickets = ticketRepository.findByEmailOrderByTicketGeneratedAtDesc(email);
        List<TicketSummaryDto> summaries = tickets.stream()
                .map(t -> new TicketSummaryDto(t.getId(), t.getPnr(), t.getFlightName(), t.getRoute(), t.getTicketGeneratedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadTicketById(@PathVariable Long id) {
        Optional<TicketEntity> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty() || ticketOpt.get().getPdfBlob() == null) {
            return ResponseEntity.notFound().build();
        }
        TicketEntity ticket = ticketOpt.get();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=E-Ticket_" + ticket.getPnr() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(ticket.getPdfBlob());
    }

    private void saveTicket(TicketRequestDto request, String pnr, byte[] pdfBytes) {
        TicketEntity ticket = new TicketEntity();
        ticket.setFlightName(request.getFlightName());
        ticket.setRoute(request.getRoute());
        ticket.setPnr(pnr);
        ticket.setEmail(request.getEmail());
        ticket.setPdfBlob(pdfBytes);
        ticket.setTicketGeneratedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    private String generatePnr() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}

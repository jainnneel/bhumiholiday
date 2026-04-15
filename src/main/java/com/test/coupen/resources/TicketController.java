package com.test.coupen.resources;

import com.test.coupen.TicketRequestDto;
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
import java.util.UUID;

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
            String pnr = generatePnr();
            byte[] pdfBytes = pdfGeneratorService.generateTicketPdf(request, pnr);
            
            // Save to DB
            saveTicket(request, pnr, pdfBytes);

            // Send Email
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
            String pnr = generatePnr();
            byte[] pdfBytes = pdfGeneratorService.generateTicketPdf(request, pnr);
            
            // Save to DB
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

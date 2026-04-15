package com.test.coupen.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class TicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String flightName;
    private String route;
    private String pnr;
    private String email;

    @Column(columnDefinition="bytea")
    private byte[] pdfBlob;

    private LocalDateTime ticketGeneratedAt;
}

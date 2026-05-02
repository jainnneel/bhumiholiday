package com.test.coupen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TicketSummaryDto {
    private Long id;
    private String pnr;
    private String flightName;
    private String route;
    private LocalDateTime ticketGeneratedAt;
}

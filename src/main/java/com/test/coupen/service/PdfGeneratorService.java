package com.test.coupen.service;

import com.test.coupen.TicketRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    @Autowired
    private TemplateEngine templateEngine;

    public byte[] generateTicketPdf(TicketRequestDto request, String pnr) throws Exception {
        Context context = new Context();
        context.setVariable("ticket", request);
        context.setVariable("pnr", pnr);
        context.setVariable("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")));
        
        // Calculate Total Price
        double price = request.getPricePerPerson() != null ? request.getPricePerPerson() : 0.0;
        double discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0;
        int pax = request.getTotalPassengers() > 0 ? request.getTotalPassengers() : 1;
        double totalPrice = (price - discount) * pax;
        context.setVariable("totalPrice", totalPrice);
        context.setVariable("pricePP", price - discount);

        String html = templateEngine.process("ticket-template", context);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(outputStream);

        return outputStream.toByteArray();
    }
}

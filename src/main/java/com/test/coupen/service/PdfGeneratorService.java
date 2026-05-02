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
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfGeneratorService {

    @Autowired
    private TemplateEngine templateEngine;

    public byte[] generateTicketPdf(TicketRequestDto request, String pnr) throws Exception {
        Context context = new Context();
        request.setLogoUrl("https://res.cloudinary.com/dp4qgdivh/image/upload/v1777735815/logo_zurpen.png");
        context.setVariable("ticket", request);
        context.setVariable("pnr", pnr);
        context.setVariable("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")));

        // Build per-passenger rows with type label (A/C/I)
        List<String> names = request.getPassengerNames();
        int adultCount  = request.getAdults();
        int childCount  = request.getChildren();
        int pax = request.getTotalPassengers() > 0 ? request.getTotalPassengers() : 1;
        List<String> passengerRows = new ArrayList<>();
        for (int i = 0; i < pax; i++) {
            String name = (names != null && i < names.size() && names.get(i) != null && !names.get(i).isBlank())
                    ? names.get(i) : "Passenger " + (i + 1);
            String type = i < adultCount ? "A" : i < adultCount + childCount ? "C" : "I";
            passengerRows.add(name + " (" + type + ")");
        }
        context.setVariable("passengerRows", passengerRows);

        // Calculate Total Price
        double price = request.getPricePerPerson() != null ? request.getPricePerPerson() : 0.0;
        double discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0;
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

package com.test.coupen.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.activation.DataSource;
import jakarta.mail.util.ByteArrayDataSource;
import com.test.coupen.TicketRequestDto;

@Service
public class EmailService {

    @Autowired(required=false)
    private JavaMailSender mailSender;

    public void sendTicketEmail(String toEmail, byte[] pdfData, TicketRequestDto request, String pnr) throws Exception {
        if(mailSender == null) {
            System.out.println("JavaMailSender not configured. Skipping email sending to " + toEmail);
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("info@bhumiholidays.in");
        helper.setTo(toEmail);
        helper.setSubject("Your Flight E-Ticket - " + pnr);

        String htmlContent = "<html><body style='font-family: Arial, sans-serif;'>"
                + "<p>Dear User,</p>"
                + "<p>We wish to inform you that your flight ticket has been generated successfully. Please review your itinerary carefully.</p>"
                + "<div style='border:1px solid #E2E8F0; border-left:4px solid #F59E0B; padding:15px; margin: 20px 0; border-radius: 8px; background: #fdfdfd;'>"
                + "  <h3 style='color:#F59E0B; margin-top:0;'>Flight Notification Details</h3>"
                + "  <table style='width:100%; border-spacing: 0px 10px; text-align: left;'>"
                + "    <tr><td style='width: 30%; color: #64748B;'>PNR</td><td style='font-weight:bold;'>" + pnr + "</td></tr>"
                + "    <tr><td style='color: #64748B;'>Airline</td><td style='font-weight:bold;'>" + request.getFlightName() + "</td></tr>"
                + "    <tr><td style='color: #64748B;'>Flight No</td><td style='font-weight:bold;'>" + request.getFlightLabel() + "</td></tr>"
                + "    <tr><td style='color: #64748B;'>Sector</td><td style='font-weight:bold;'>" + request.getRoute() + "</td></tr>"
                + "    <tr><td style='color: #64748B;'>Date & Time</td><td>" + request.getDate() + " at " + request.getTime() + "</td></tr>"
                + "  </table>"
                + "</div>"
                + "<p>Your <b>e-ticket</b> is attached with this mail. Kindly ensure you carry this ticket at the time of travel.</p>"
                + "<p>Thank you for choosing Bhumi Holidays.</p>"
                + "</body></html>";

        helper.setText(htmlContent, true);

        DataSource dataSource = new ByteArrayDataSource(pdfData, "application/pdf");
        helper.addAttachment("E-Ticket_" + pnr + ".pdf", dataSource);

        mailSender.send(message);
    }
}

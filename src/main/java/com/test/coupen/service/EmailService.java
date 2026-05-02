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

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendTicketEmail(String toEmail, byte[] pdfData, TicketRequestDto req, String pnr) throws Exception {
        if (mailSender == null) {
            System.out.println("JavaMailSender not configured. Skipping email to " + toEmail);
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("info@bhumiholidays.in");
        helper.setTo(toEmail);
        helper.setSubject("Your Flight E-Ticket \u2013 PNR: " + pnr);

        String name      = req.getPrimaryPassengerName();
        String sector    = buildSector(req);
        String departure = (req.getTime() != null ? req.getTime() : "") + ", " + esc(req.getDate());
        String arrival   = (req.getArrivalTime() != null && !req.getArrivalTime().isBlank())
                            ? req.getArrivalTime() + ", " + esc(req.getDate()) : "\u2014";

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head>"
          + "<body style='margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;'>"
          + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f6f9;padding:30px 10px;'>"
          + "<tr><td align='center'>"
          + "<table width='600' cellpadding='0' cellspacing='0' "
          + "style='background:#ffffff;border-radius:4px;border:1px solid #e2e8f0;font-size:14px;color:#334155;'>"

          // top amber accent line
          + "<tr><td style='height:4px;background:#f59e0b;font-size:0;line-height:0;'>&nbsp;</td></tr>"

          // logo header
          + "<tr><td style='padding:18px 32px 0;border-bottom:1px solid #f1f5f9;'>"
          + "<table cellpadding='0' cellspacing='0'><tr>"
          + "<td style='vertical-align:middle;'>"
          + "<img src='https://res.cloudinary.com/dp4qgdivh/image/upload/v1777735815/logo_zurpen.png' alt='Bhumi Holidays' "
          + "style='height:50px;width:auto;display:block;' /></td>"
          + "<td style='padding-left:12px;vertical-align:middle;'>"
          + "<p style='margin:0;font-size:16px;font-weight:bold;color:#1D4ED8;'>BHUMI HOLIDAYS</p>"
          + "<p style='margin:0;font-size:11px;color:#64748b;'>info@bhumiholidays.in &nbsp;|&nbsp; +91 89803 45600</p>"
          + "</td></tr></table>"
          + "<div style='height:14px;'></div>"
          + "</td></tr>"

          // body
          + "<tr><td style='padding:28px 32px;'>"

          // greeting
          + "<p style='margin:0 0 2px;font-size:15px;color:#1D4ED8;font-weight:bold;'>Dear " + esc(name) + ",</p>"
          + "<p style='margin:0 0 22px;font-size:13px;color:#475569;line-height:1.6;'>"
          + "We are pleased to confirm your flight booking. Please review the revised schedule carefully and plan your journey accordingly."
          + "</p>"

          // Flight Notification Details box
          + "<table width='100%' cellpadding='0' cellspacing='0' "
          + "style='border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:22px;'>"
          + "<tr><td style='background:#fffbeb;padding:12px 16px;'>"
          + "<table cellpadding='0' cellspacing='0'><tr>"
          + "<td style='width:26px;height:26px;background:#f59e0b;border-radius:50%;text-align:center;"
          + "color:#fff;font-weight:bold;font-size:13px;line-height:26px;vertical-align:middle;'>i</td>"
          + "<td style='padding-left:10px;font-weight:bold;color:#92400e;font-size:14px;'>Flight Notification Details</td>"
          + "</tr></table>"
          + "</td></tr>"
          + "<tr><td style='padding:14px 16px;'>"
          + "<table width='100%' cellpadding='0' cellspacing='0'>"
          + detailRow("PNR",           "<strong style='letter-spacing:1px;font-size:14px;'>" + esc(pnr) + "</strong>")
          + detailRow("Airline",       "<strong>" + esc(req.getFlightName()) + "</strong>")
          + detailRow("Flight No",     "<strong>" + esc(req.getFlightLabel()) + "</strong>")
          + detailRow("Sector",        "<strong>" + esc(sector) + "</strong>")
          + detailRow("Passengers",    buildPassengerList(req))
          + detailRow("Flight Status",
              "<span style='background:#fef9c3;color:#854d0e;font-size:12px;font-weight:bold;"
            + "padding:3px 10px;border-radius:4px;border:1px solid #fde047;'>Flight Confirmed</span>")
          + "</table>"
          + "</td></tr>"
          + "</table>"

          // Onward section (grey bordered)
          + "<table width='100%' cellpadding='0' cellspacing='0' "
          + "style='border:1px solid #e2e8f0;border-radius:4px;margin-bottom:16px;'>"
          + "<tr><td style='padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;'>"
          + "<span style='font-size:13px;font-weight:bold;color:#334155;'>Onward</span>"
          + "</td></tr>"
          + "<tr><td style='padding:12px 14px;'>"
          + "<table width='100%' cellpadding='4' cellspacing='0'><tr>"

          // Current (green box) — fresh booking, no Previous
          + "<td style='width:48%;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:12px;vertical-align:top;'>"
          + "<p style='margin:0 0 8px;font-size:12px;font-weight:bold;color:#15803d;'>Current:</p>"
          + "<p style='margin:3px 0;font-size:12px;color:#374151;'>Sector:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style='color:#15803d;font-weight:bold;'>" + esc(sector) + "</span></p>"
          + "<p style='margin:3px 0;font-size:12px;color:#374151;'>Departure:&nbsp;<span style='color:#15803d;font-weight:bold;'>" + departure + "</span></p>"
          + "<p style='margin:3px 0;font-size:12px;color:#374151;'>Arrival:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style='color:#15803d;font-weight:bold;'>" + arrival + "</span></p>"
          + "</td>"
          + "<td>&nbsp;</td>"
          + "</tr></table>"
          + "</td></tr>"
          + "</table>"

          // blue note
          + "<table width='100%' cellpadding='0' cellspacing='0' "
          + "style='background:#EFF6FF;border:1px solid #bfdbfe;border-radius:4px;margin-bottom:22px;'>"
          + "<tr><td style='padding:11px 14px;font-size:13px;color:#1e40af;'>"
          + "&#10003;&nbsp;Please consider only the <strong>Current Flight Time</strong> for your travel."
          + "</td></tr>"
          + "</table>"

          // Your E-Ticket box
          + "<table width='100%' cellpadding='0' cellspacing='0' "
          + "style='border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:4px;'>"
          + "<tr><td style='background:#fffbeb;padding:12px 16px;'>"
          + "<table cellpadding='0' cellspacing='0'><tr>"
          + "<td style='font-size:20px;line-height:1;'>&#128196;</td>"
          + "<td style='padding-left:10px;font-weight:bold;color:#92400e;font-size:14px;'>Your Updated Ticket</td>"
          + "</tr></table>"
          + "</td></tr>"
          + "<tr><td style='padding:14px 16px;font-size:13px;color:#475569;line-height:1.6;'>"
          + "Your <strong>updated e-ticket</strong> reflecting the booking details is attached with this mail. "
          + "Kindly ensure you carry this latest ticket at the time of travel."
          + "</td></tr>"
          + "</table>"

          + "</td></tr>" // end body padding

          // dark footer
          + "<tr><td style='background:#1e293b;padding:18px 32px;text-align:center;'>"
          + "<p style='margin:0 0 6px;color:#94a3b8;font-size:12px;'>"
          + "We sincerely thank you for choosing Bhumi Holidays and appreciate your patience."
          + "</p>"
          + "<p style='margin:0 0 4px;color:#64748b;font-size:11px;'>For queries, please reach us at:</p>"
          + "<p style='margin:0;font-size:11px;'>"
          + "Email:&nbsp;<a href='mailto:info@bhumiholidays.in' "
          + "style='color:#f97316;text-decoration:none;'>info@bhumiholidays.in</a>"
          + "&nbsp;&nbsp;Phone:&nbsp;<a href='tel:+918980345600' "
          + "style='color:#f97316;text-decoration:none;'>+91 89803 45600</a>"
          + "</p>"
          + "</td></tr>"

          + "</table></td></tr></table>"
          + "</body></html>";

        helper.setText(html, true);

        DataSource ds = new ByteArrayDataSource(pdfData, "application/pdf");
        helper.addAttachment("E-Ticket_" + pnr + ".pdf", ds);

        mailSender.send(message);
    }

    private static String detailRow(String label, String value) {
        return "<tr>"
             + "<td style='color:#64748b;font-size:13px;padding:5px 0;width:120px;vertical-align:top;'>" + label + "</td>"
             + "<td style='font-size:13px;padding:5px 0;vertical-align:top;'>" + value + "</td>"
             + "</tr>";
    }

    private static String buildPassengerList(TicketRequestDto req) {
        java.util.List<String> names = req.getPassengerNames();
        int pax = req.getTotalPassengers() > 0 ? req.getTotalPassengers() : 1;
        int adultCount = req.getAdults();
        int childCount = req.getChildren();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < pax; i++) {
            String n = (names != null && i < names.size() && names.get(i) != null && !names.get(i).isBlank())
                    ? names.get(i) : "Passenger " + (i + 1);
            String type = i < adultCount ? "Adult" : i < adultCount + childCount ? "Child" : "Infant";
            if (sb.length() > 0) sb.append("<br/>");
            sb.append(esc(n)).append(" <span style='color:#64748b;font-size:11px;'>(").append(type).append(")</span>");
        }
        return sb.toString();
    }

    private static String buildSector(TicketRequestDto req) {
        if (req.getFromCity() != null && !req.getFromCity().isBlank()
         && req.getToCity()   != null && !req.getToCity().isBlank()) {
            return req.getFromCity() + " \u2192 " + req.getToCity();
        }
        return req.getRoute() != null ? req.getRoute() : "";
    }

    private static String esc(String v) {
        if (v == null) return "";
        return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}

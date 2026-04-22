package com.Ticketing.service;

import com.Ticketing.model.Ticket;
import com.Ticketing.model.User;
import com.Ticketing.model.enums.TicketStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Async
    public void sendTicketCreatedEmail(Ticket ticket) {
        if (!mailEnabled) return;
        try {
            String subject = String.format("Ticket #%d Created: %s", ticket.getId(), ticket.getSubject());
            String body = String.format(
                    "Hello %s,\n\nYour ticket has been created successfully.\n\n" +
                    "Ticket ID: #%d\nSubject: %s\nPriority: %s\nStatus: %s\n\n" +
                    "Thank you for contacting support.",
                    ticket.getOwner().getFullName(), ticket.getId(),
                    ticket.getSubject(), ticket.getPriority(), ticket.getStatus()
            );
            sendEmail(ticket.getOwner().getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send ticket created email", e);
        }
    }

    @Async
    public void sendTicketAssignedEmail(Ticket ticket, User assignee) {
        if (!mailEnabled) return;
        try {
            String subject = String.format("Ticket #%d has been assigned to you", ticket.getId());
            String body = String.format(
                    "Hello %s,\n\nTicket #%d has been assigned to you.\n\n" +
                    "Subject: %s\nPriority: %s\nStatus: %s\n\nPlease review and take action.",
                    assignee.getFullName(), ticket.getId(),
                    ticket.getSubject(), ticket.getPriority(), ticket.getStatus()
            );
            sendEmail(assignee.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send ticket assigned email", e);
        }
    }

    @Async
    public void sendStatusChangedEmail(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        if (!mailEnabled) return;
        try {
            String subject = String.format("Ticket #%d Status Updated", ticket.getId());
            String body = String.format(
                    "Hello %s,\n\nThe status of your ticket has been updated.\n\n" +
                    "Ticket ID: #%d\nSubject: %s\nPrevious Status: %s\nNew Status: %s",
                    ticket.getOwner().getFullName(), ticket.getId(),
                    ticket.getSubject(), oldStatus, newStatus
            );
            sendEmail(ticket.getOwner().getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send status changed email", e);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}

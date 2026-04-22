package com.Ticketing.controller;

import com.Ticketing.model.enums.TicketStatus;
import com.Ticketing.repository.TicketRepository;
import com.Ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalTickets", ticketRepository.count());
        stats.put("openTickets", ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.put("inProgressTickets", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.put("resolvedTickets", ticketRepository.countByStatus(TicketStatus.RESOLVED));
        stats.put("closedTickets", ticketRepository.countByStatus(TicketStatus.CLOSED));
        stats.put("totalUsers", userRepository.count());

        return ResponseEntity.ok(stats);
    }
}

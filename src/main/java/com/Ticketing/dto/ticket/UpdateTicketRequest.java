package com.Ticketing.dto.ticket;

import com.Ticketing.model.enums.Priority;
import com.Ticketing.model.enums.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketRequest {
    private String subject;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private Long assigneeId;
}

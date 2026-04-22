package com.Ticketing.dto.ticket;

import com.Ticketing.model.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank
    private String subject;

    @NotBlank
    private String description;

    @NotNull
    private Priority priority;

    private Long assigneeId;
}

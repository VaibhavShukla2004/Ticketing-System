package com.Ticketing.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCommentRequest {
    @NotBlank
    private String content;
}

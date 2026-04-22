package com.Ticketing.dto.ticket;

import com.Ticketing.model.enums.Priority;
import com.Ticketing.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String subject;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private UserSummary owner;
    private UserSummary assignee;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
    private Integer rating;
    private String ratingFeedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String role;
    }

    @Data
    @Builder
    public static class CommentResponse {
        private Long id;
        private String content;
        private UserSummary author;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class AttachmentResponse {
        private Long id;
        private String fileName;
        private String storedFileName;
        private String contentType;
        private Long fileSize;
        private LocalDateTime uploadedAt;
    }
}

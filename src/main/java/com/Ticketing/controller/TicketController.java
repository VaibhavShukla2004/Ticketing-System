package com.Ticketing.controller;

import com.Ticketing.dto.ticket.*;
import com.Ticketing.model.Attachment;
import com.Ticketing.model.User;
import com.Ticketing.model.enums.Priority;
import com.Ticketing.model.enums.TicketStatus;
import com.Ticketing.service.FileStorageService;
import com.Ticketing.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, currentUser));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getMyTickets(
                currentUser, status, priority, search, page, size, sortBy, sortDir));
    }

    @GetMapping
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getAllTickets(
                status, priority, assigneeId, search, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.addComment(id, request, currentUser));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<TicketResponse> rateTicket(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.rateTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketResponse.AttachmentResponse> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {
        Attachment attachment = fileStorageService.uploadFile(id, file, currentUser);
        return ResponseEntity.ok(TicketResponse.AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploadedAt(attachment.getUploadedAt())
                .build());
    }

    @GetMapping("/attachments/{storedFileName}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String storedFileName) throws MalformedURLException {
        Resource resource = fileStorageService.loadFileAsResource(storedFileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long id,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal User currentUser) {
        fileStorageService.deleteAttachment(attachmentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ticketService.deleteTicket(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMultipleTickets(
            @RequestParam List<Long> ids,
            @AuthenticationPrincipal User currentUser) {
        ticketService.deleteTickets(ids, currentUser);
        return ResponseEntity.noContent().build();
    }
}

package com.Ticketing.service;

import com.Ticketing.dto.ticket.*;
import com.Ticketing.model.*;
import com.Ticketing.model.enums.Priority;
import com.Ticketing.model.enums.Role;
import com.Ticketing.model.enums.TicketStatus;
import com.Ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, User currentUser) {
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .filter(u -> u.getRole() == Role.SUPPORT_AGENT || u.getRole() == Role.ADMIN)
                    .orElse(null);
        }

        Ticket ticket = Ticket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .owner(currentUser)
                .assignee(assignee)
                .build();

        ticketRepository.save(ticket);
        emailService.sendTicketCreatedEmail(ticket);
        return mapToResponse(ticket);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getMyTickets(User currentUser, TicketStatus status,
                                              Priority priority, String search,
                                              int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ticketRepository.findByOwnerFiltered(currentUser, status, priority, search, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(TicketStatus status, Priority priority,
                                              Long assigneeId, String search,
                                              int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ticketRepository.findAllFiltered(status, priority, assigneeId, search, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id, User currentUser) {
        Ticket ticket = findTicketById(id);
        validateAccess(ticket, currentUser);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicket(Long id, UpdateTicketRequest request, User currentUser) {
        Ticket ticket = findTicketById(id);
        validateAccess(ticket, currentUser);

        boolean isAdminOrAgent = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPPORT_AGENT;
        boolean isOwner = ticket.getOwner().getId().equals(currentUser.getId());

        if (request.getSubject() != null && isOwner) ticket.setSubject(request.getSubject());
        if (request.getDescription() != null && isOwner) ticket.setDescription(request.getDescription());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());

        if (request.getStatus() != null) {
            if (isAdminOrAgent) {
                TicketStatus oldStatus = ticket.getStatus();
                ticket.setStatus(request.getStatus());
                if (oldStatus != request.getStatus()) {
                    emailService.sendStatusChangedEmail(ticket, oldStatus, request.getStatus());
                }
            }
        }

        if (request.getAssigneeId() != null && isAdminOrAgent) {
            User newAssignee = userRepository.findById(request.getAssigneeId())
                    .filter(u -> u.getRole() == Role.SUPPORT_AGENT || u.getRole() == Role.ADMIN)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid assignee"));
            ticket.setAssignee(newAssignee);
            emailService.sendTicketAssignedEmail(ticket, newAssignee);
        }

        ticketRepository.save(ticket);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse addComment(Long ticketId, AddCommentRequest request, User currentUser) {
        Ticket ticket = findTicketById(ticketId);
        validateAccess(ticket, currentUser);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .ticket(ticket)
                .author(currentUser)
                .build();

        commentRepository.save(comment);
        ticket.getComments().add(comment);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse rateTicket(Long id, RatingRequest request, User currentUser) {
        Ticket ticket = findTicketById(id);

        if (!ticket.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the ticket owner can rate the resolution");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new IllegalStateException("Ticket must be resolved or closed before rating");
        }

        ticket.setRating(request.getRating());
        ticket.setRatingFeedback(request.getFeedback());
        ticketRepository.save(ticket);
        return mapToResponse(ticket);
    }

    @Transactional
    public void deleteTicket(Long id, User currentUser) {
        Ticket ticket = findTicketById(id);
        if (currentUser.getRole() != Role.ADMIN && !ticket.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        ticketRepository.delete(ticket);
    }

    @Transactional
    public void deleteTickets(List<Long> ids, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can perform bulk deletion");
        }
        List<Ticket> tickets = ticketRepository.findAllById(ids);
        ticketRepository.deleteAll(tickets);
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    private void validateAccess(Ticket ticket, User currentUser) {
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAgent = currentUser.getRole() == Role.SUPPORT_AGENT;
        boolean isOwner = ticket.getOwner().getId().equals(currentUser.getId());
        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isAgent && !isOwner && !isAssignee) {
            throw new AccessDeniedException("Access denied to this ticket");
        }
    }

    public TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .owner(mapUserSummary(ticket.getOwner()))
                .assignee(ticket.getAssignee() != null ? mapUserSummary(ticket.getAssignee()) : null)
                .comments(ticket.getComments().stream()
                        .map(c -> TicketResponse.CommentResponse.builder()
                                .id(c.getId())
                                .content(c.getContent())
                                .author(mapUserSummary(c.getAuthor()))
                                .createdAt(c.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .attachments(ticket.getAttachments().stream()
                        .map(a -> TicketResponse.AttachmentResponse.builder()
                                .id(a.getId())
                                .fileName(a.getFileName())
                                .storedFileName(a.getStoredFileName())
                                .contentType(a.getContentType())
                                .fileSize(a.getFileSize())
                                .uploadedAt(a.getUploadedAt())
                                .build())
                        .collect(Collectors.toList()))
                .rating(ticket.getRating())
                .ratingFeedback(ticket.getRatingFeedback())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private TicketResponse.UserSummary mapUserSummary(User user) {
        return TicketResponse.UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}

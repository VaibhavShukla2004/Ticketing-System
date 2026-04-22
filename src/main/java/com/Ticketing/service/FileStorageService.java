package com.Ticketing.service;

import com.Ticketing.model.Attachment;
import com.Ticketing.model.Ticket;
import com.Ticketing.model.User;
import com.Ticketing.model.enums.Role;
import com.Ticketing.repository.AttachmentRepository;
import com.Ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public Attachment uploadFile(Long ticketId, MultipartFile file, User currentUser) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = ticket.getOwner().getId().equals(currentUser.getId());
        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner && !isAssignee) {
            throw new AccessDeniedException("No access to this ticket");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String storedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetLocation = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .storedFileName(storedFileName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .ticket(ticket)
                .uploadedBy(currentUser)
                .build();

        return attachmentRepository.save(attachment);
    }

    public Resource loadFileAsResource(String storedFileName) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(storedFileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new IllegalArgumentException("File not found: " + storedFileName);
        }
        return resource;
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, User currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        if (currentUser.getRole() != Role.ADMIN &&
                !attachment.getUploadedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Cannot delete this attachment");
        }

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath()
                    .normalize().resolve(attachment.getStoredFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}

        attachmentRepository.delete(attachment);
    }
}

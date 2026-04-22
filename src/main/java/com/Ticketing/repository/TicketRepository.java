package com.Ticketing.repository;

import com.Ticketing.model.Ticket;
import com.Ticketing.model.User;
import com.Ticketing.model.enums.Priority;
import com.Ticketing.model.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByOwner(User owner, Pageable pageable);

    Page<Ticket> findByAssignee(User assignee, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByOwnerAndStatus(User owner, TicketStatus status, Pageable pageable);

    @Query("""
        SELECT t FROM Ticket t
        WHERE (:status IS NULL OR t.status = :status)
          AND (:priority IS NULL OR t.priority = :priority)
          AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
          AND (:search IS NULL OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Ticket> findAllFiltered(
            @Param("status") TicketStatus status,
            @Param("priority") Priority priority,
            @Param("assigneeId") Long assigneeId,
            @Param("search") String search,
            Pageable pageable);

    @Query("""
        SELECT t FROM Ticket t
        WHERE t.owner = :owner
          AND (:status IS NULL OR t.status = :status)
          AND (:priority IS NULL OR t.priority = :priority)
          AND (:search IS NULL OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Ticket> findByOwnerFiltered(
            @Param("owner") User owner,
            @Param("status") TicketStatus status,
            @Param("priority") Priority priority,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(TicketStatus status);
    long countByOwner(User owner);
    long countByAssigneeAndStatus(User assignee, TicketStatus status);
}

package com.Ticketing.repository;

import com.Ticketing.model.User;
import com.Ticketing.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    Page<User> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
            String fullName, String username, Pageable pageable);
}

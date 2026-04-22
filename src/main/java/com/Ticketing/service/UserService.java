package com.Ticketing.service;

import com.Ticketing.dto.user.UpdateUserRoleRequest;
import com.Ticketing.dto.user.UserResponse;
import com.Ticketing.model.User;
import com.Ticketing.model.enums.Role;
import com.Ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search != null && !search.isBlank()) {
            return userRepository.findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(search, search, pageable)
                    .map(this::mapToResponse);
        }
        return userRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return mapToResponse(findUserById(id));
    }

    @Transactional
    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = findUserById(id);
        user.setRole(request.getRole());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleUserEnabled(Long id) {
        User user = findUserById(id);
        user.setEnabled(!user.isEnabled());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.delete(findUserById(id));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getSupportAgents() {
        return userRepository.findByRole(Role.SUPPORT_AGENT)
                .stream()
                .filter(User::isEnabled)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(User user) {
        return mapToResponse(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

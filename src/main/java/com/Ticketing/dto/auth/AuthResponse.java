package com.Ticketing.dto.auth;

import com.Ticketing.model.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private Long userId;
}

package com.Ticketing.config;

import com.Ticketing.model.User;
import com.Ticketing.model.enums.Role;
import com.Ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@ticketing.com")
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created: username=admin, password=admin123");
        }

        // Create a default support agent
        if (!userRepository.existsByUsername("agent1")) {
            User agent = User.builder()
                    .username("agent1")
                    .password(passwordEncoder.encode("agent123"))
                    .email("agent1@ticketing.com")
                    .fullName("Support Agent One")
                    .role(Role.SUPPORT_AGENT)
                    .enabled(true)
                    .build();
            userRepository.save(agent);
            log.info("Default support agent created: username=agent1, password=agent123");
        }

        // Create a default user
        if (!userRepository.existsByUsername("user1")) {
            User user = User.builder()
                    .username("user1")
                    .password(passwordEncoder.encode("user123"))
                    .email("user1@ticketing.com")
                    .fullName("Demo User")
                    .role(Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Default user created: username=user1, password=user123");
        }
    }
}

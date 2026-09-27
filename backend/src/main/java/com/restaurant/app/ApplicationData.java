package com.restaurant.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationData {
    @Bean ApplicationRunner initialAdmin(UserRepository users, PasswordEncoder encoder,
            @Value("${app.bootstrap.admin-username}") String username,
            @Value("${app.bootstrap.admin-email}") String email,
            @Value("${app.bootstrap.admin-password}") String password) {
        return args -> {
            if (username.isBlank() && email.isBlank() && password.isBlank()) return;
            if (username.isBlank() || email.isBlank() || password.length() < 12)
                throw new IllegalStateException("Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) together.");
            if (users.count() == 0) users.save(new AppUser(username, email, encoder.encode(password), UserRole.ADMIN));
        };
    }
}
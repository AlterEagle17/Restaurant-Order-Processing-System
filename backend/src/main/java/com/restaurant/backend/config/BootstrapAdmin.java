package com.restaurant.backend.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.user.Role;
import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@Component
public class BootstrapAdmin implements ApplicationRunner {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String username;
	private final String password;
	private final String displayName;

	public BootstrapAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder,
			@Value("${BOOTSTRAP_ADMIN_USERNAME:}") String username,
			@Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password,
			@Value("${BOOTSTRAP_ADMIN_DISPLAY_NAME:Restaurant Administrator}") String displayName) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.username = username;
		this.password = password;
		this.displayName = displayName;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (username.isBlank() && password.isBlank()) return;
		if (username.isBlank() || password.isBlank() || password.length() < 12 || password.length() > 72) {
			throw new IllegalStateException("Set both BOOTSTRAP_ADMIN_USERNAME and a 12-72 character BOOTSTRAP_ADMIN_PASSWORD");
		}
		if (userRepository.count() != 0) return;
		userRepository.save(new UserAccount(username.trim().toLowerCase(Locale.ROOT), passwordEncoder.encode(password),
				displayName.trim(), Role.ADMIN));
	}
}
package com.restaurant.backend.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
	private final UserRepository userRepository;

	public DatabaseUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserAccount account = userRepository.findByUsernameIgnoreCase(username)
				.orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
		return User.withUsername(account.getUsername())
				.password(account.getPasswordHash())
				.roles(account.getRole().name())
				.disabled(!account.isActive())
				.build();
	}
}
package com.restaurant.backend.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.ResourceNotFoundException;
import com.restaurant.backend.security.JwtService;
import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@Service
public class AuthService {
	private final AuthenticationManager authenticationManager;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
			PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.authenticationManager = authenticationManager;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		try {
			authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
					request.username().trim(), request.password()));
		} catch (AuthenticationException exception) {
			throw new InvalidCredentialsException();
		}
		UserAccount user = userRepository.findByUsernameIgnoreCase(request.username().trim())
				.orElseThrow(() -> new AuthenticationServiceException("Authentication failed"));
		return new LoginResponse(jwtService.issue(user), "Bearer", jwtService.getExpirationMs(), AuthUserResponse.from(user));
	}

	@Transactional(readOnly = true)
	public CurrentUserResponse currentUser(String username) {
		return userRepository.findByUsernameIgnoreCase(username)
				.map(CurrentUserResponse::from)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	public boolean passwordMatches(String rawPassword, String hash) {
		return passwordEncoder.matches(rawPassword, hash);
	}
}
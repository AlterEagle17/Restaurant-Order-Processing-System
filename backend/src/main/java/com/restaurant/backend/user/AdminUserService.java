package com.restaurant.backend.user;

import java.util.UUID;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.ConflictException;
import com.restaurant.backend.common.PageRequests;
import com.restaurant.backend.common.ResourceNotFoundException;

@Service
public class AdminUserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public Page<UserResponse> list(String query, Role role, Boolean active, int page, int size) {
		String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
		return userRepository.search(normalizedQuery, role, active, PageRequests.of(page, size)).map(UserResponse::from);
	}

	@Transactional
	public UserResponse create(CreateUserRequest request) {
		ensureUsernameAvailable(request.username(), null);
		UserAccount user = new UserAccount(normalizeUsername(request.username()), passwordEncoder.encode(request.password()),
				request.displayName().trim(), request.role());
		return UserResponse.from(userRepository.save(user));
	}

	@Transactional
	public UserResponse update(UUID id, UpdateUserRequest request) {
		UserAccount user = requireUser(id);
		if (user.isTableAccount()) throw new ConflictException("Table account identity cannot be changed");
		ensureUsernameAvailable(request.username(), id);
		user.updateProfile(normalizeUsername(request.username()), request.displayName().trim());
		return UserResponse.from(user);
	}

	@Transactional
	public UserResponse updateStatus(UUID id, boolean active, String actorUsername) {
		UserAccount user = requireUser(id);
		if (!active) {
			preventSelfLockout(user, actorUsername);
			preventLastAdministrator(user);
		}
		user.setActive(active);
		return UserResponse.from(user);
	}

	@Transactional
	public UserResponse updateRole(UUID id, Role role, String actorUsername) {
		UserAccount user = requireUser(id);
		if (user.isTableAccount() && role != Role.CUSTOMER) {
			throw new ConflictException("Table accounts must keep the CUSTOMER role");
		}
		if (role != Role.ADMIN) {
			preventSelfLockout(user, actorUsername);
			preventLastAdministrator(user);
		}
		user.setRole(role);
		return UserResponse.from(user);
	}

	@Transactional
	public void resetPassword(UUID id, String newPassword) {
		requireUser(id).setPasswordHash(passwordEncoder.encode(newPassword));
	}

	private UserAccount requireUser(UUID id) {
		return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private void ensureUsernameAvailable(String username, UUID currentId) {
		userRepository.findByUsernameIgnoreCase(normalizeUsername(username)).ifPresent(existing -> {
			if (!existing.getId().equals(currentId)) throw new ConflictException("Username is already in use");
		});
	}

	private void preventSelfLockout(UserAccount target, String actorUsername) {
		if (target.getUsername().equalsIgnoreCase(actorUsername)) {
			throw new ConflictException("You cannot deactivate or demote your own administrator account");
		}
	}

	private void preventLastAdministrator(UserAccount target) {
		if (target.getRole() == Role.ADMIN && target.isActive() && userRepository.countByRoleAndActiveTrue(Role.ADMIN) <= 1) {
			throw new ConflictException("At least one active administrator must remain");
		}
	}

	private String normalizeUsername(String username) { return username.trim().toLowerCase(Locale.ROOT); }
}
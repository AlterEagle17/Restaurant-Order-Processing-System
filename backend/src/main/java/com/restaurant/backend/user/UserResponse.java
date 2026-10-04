package com.restaurant.backend.user;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String username, String displayName, Role role, boolean active,
		boolean tableAccount, Integer tableNumber, Instant createdAt) {
	public static UserResponse from(UserAccount user) {
		return new UserResponse(user.getId(), user.getUsername(), user.getDisplayName(), user.getRole(), user.isActive(),
				user.isTableAccount(), user.getTableNumber(), user.getCreatedAt());
	}
}
package com.restaurant.backend.auth;

import java.util.UUID;

import com.restaurant.backend.user.Role;
import com.restaurant.backend.user.UserAccount;

public record CurrentUserResponse(UUID id, String username, String displayName, Role role, boolean active) {
	public static CurrentUserResponse from(UserAccount user) {
		return new CurrentUserResponse(user.getId(), user.getUsername(), user.getDisplayName(), user.getRole(), user.isActive());
	}
}
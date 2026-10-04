package com.restaurant.backend.auth;

import java.util.UUID;

import com.restaurant.backend.user.Role;
import com.restaurant.backend.user.UserAccount;

public record AuthUserResponse(UUID id, String username, String displayName, Role role,
		boolean tableAccount, Integer tableNumber) {
	public static AuthUserResponse from(UserAccount user) {
		return new AuthUserResponse(user.getId(), user.getUsername(), user.getDisplayName(), user.getRole(),
				user.isTableAccount(), user.getTableNumber());
	}
}
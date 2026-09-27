package com.restaurant.backend.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
		@NotBlank @Size(max = 80) @Pattern(regexp = "[A-Za-z0-9._-]+") String username,
		@NotBlank @Size(min = 12, max = 72) String password,
		@NotBlank @Size(max = 120) String displayName,
		@NotNull Role role) { }
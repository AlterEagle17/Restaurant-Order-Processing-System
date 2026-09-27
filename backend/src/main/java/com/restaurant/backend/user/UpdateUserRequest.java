package com.restaurant.backend.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
		@NotBlank @Size(max = 80) @Pattern(regexp = "[A-Za-z0-9._-]+") String username,
		@NotBlank @Size(max = 120) String displayName) { }
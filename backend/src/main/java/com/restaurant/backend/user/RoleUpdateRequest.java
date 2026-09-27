package com.restaurant.backend.user;

import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(@NotNull Role role) { }
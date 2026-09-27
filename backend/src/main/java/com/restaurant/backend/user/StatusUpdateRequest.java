package com.restaurant.backend.user;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull Boolean active) { }
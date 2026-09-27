package com.restaurant.backend.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MenuCategoryUpdateRequest(@NotBlank @Size(max = 80) String name,
		@Size(max = 500) String description, @NotNull Boolean active) { }
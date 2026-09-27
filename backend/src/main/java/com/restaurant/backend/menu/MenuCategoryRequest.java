package com.restaurant.backend.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MenuCategoryRequest(@NotBlank @Size(max = 80) String name,
		@Size(max = 500) String description) { }
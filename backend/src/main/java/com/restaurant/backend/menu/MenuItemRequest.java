package com.restaurant.backend.menu;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MenuItemRequest(
		@NotBlank @Size(max = 120) String name,
		@Size(max = 1000) String description,
		@NotNull UUID categoryId,
		@NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal price,
		@Size(max = 1000) String imageUrl) { }
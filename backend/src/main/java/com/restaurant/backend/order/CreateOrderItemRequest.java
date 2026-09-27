package com.restaurant.backend.order;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderItemRequest(@NotNull UUID menuItemId, @Min(1) @Max(20) int quantity) { }
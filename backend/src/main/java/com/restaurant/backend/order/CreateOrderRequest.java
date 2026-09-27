package com.restaurant.backend.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(@Min(1) @Max(200) int tableNumber,
		@NotEmpty @Size(max = 30) List<@Valid CreateOrderItemRequest> items) { }
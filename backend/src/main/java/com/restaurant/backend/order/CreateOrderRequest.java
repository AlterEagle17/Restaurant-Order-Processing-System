package com.restaurant.backend.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(@NotBlank @Size(max = 120) String customerName,
		@NotEmpty @Size(max = 30) List<@Valid CreateOrderItemRequest> items) { }
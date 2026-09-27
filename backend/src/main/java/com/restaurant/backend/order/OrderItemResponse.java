package com.restaurant.backend.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(UUID menuItemId, String name, int quantity,
		BigDecimal unitPrice, BigDecimal lineTotal) {
	public static OrderItemResponse from(OrderLine item) {
		return new OrderItemResponse(item.getMenuItem().getId(), item.getMenuItem().getName(), item.getQuantity(),
				item.getUnitPrice(), item.getLineTotal());
	}
}
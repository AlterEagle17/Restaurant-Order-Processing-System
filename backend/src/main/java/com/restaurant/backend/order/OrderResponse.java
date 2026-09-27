package com.restaurant.backend.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.restaurant.backend.payment.PaymentStatus;

public record OrderResponse(UUID id, String orderNumber, UUID customerId, String customerName,
		int tableNumber, OrderStatus status, PaymentStatus paymentStatus, List<OrderItemResponse> items,
		BigDecimal total, Instant createdAt) {
	public static OrderResponse from(RestaurantOrder order) {
		return new OrderResponse(order.getId(), order.getOrderNumber(), order.getCustomer().getId(),
				order.getCustomer().getDisplayName(), order.getTableNumber(), order.getStatus(), order.getPaymentStatus(),
				order.getItems().stream().map(OrderItemResponse::from).toList(), order.getTotal(), order.getCreatedAt());
	}
}
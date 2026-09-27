package com.restaurant.backend.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(UUID id, UUID orderId, String orderNumber, BigDecimal amount,
		PaymentStatus status, PaymentMethod method, Instant createdAt) {
	public static PaymentResponse from(PaymentRecord payment) {
		return new PaymentResponse(payment.getId(), payment.getOrder().getId(), payment.getOrder().getOrderNumber(),
				payment.getAmount(), payment.getStatus(), payment.getMethod(), payment.getCreatedAt());
	}
}
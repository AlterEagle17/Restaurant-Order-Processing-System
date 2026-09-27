package com.restaurant.backend.payment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.restaurant.backend.order.RestaurantOrder;
import com.restaurant.backend.user.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class PaymentRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false, unique = true)
	private RestaurantOrder order;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cashier_id", nullable = false)
	private UserAccount cashier;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal amount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentMethod method;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	protected PaymentRecord() { }

	public PaymentRecord(RestaurantOrder order, UserAccount cashier, PaymentMethod method) {
		this.order = order;
		this.cashier = cashier;
		this.amount = order.getTotal();
		this.status = PaymentStatus.PAID;
		this.method = method;
	}

	public UUID getId() { return id; }
	public RestaurantOrder getOrder() { return order; }
	public BigDecimal getAmount() { return amount; }
	public PaymentStatus getStatus() { return status; }
	public PaymentMethod getMethod() { return method; }
	public Instant getCreatedAt() { return createdAt; }
}
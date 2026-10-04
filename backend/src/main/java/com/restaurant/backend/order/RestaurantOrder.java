package com.restaurant.backend.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.restaurant.backend.payment.PaymentStatus;
import com.restaurant.backend.user.UserAccount;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_orders")
public class RestaurantOrder {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "order_number", nullable = false, unique = true, length = 40)
	private String orderNumber;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "customer_id", nullable = false)
	private UserAccount customer;

	@Column(name = "customer_name", nullable = false, length = 120)
	private String customerName;

	@Column(name = "table_number", nullable = false)
	private int tableNumber;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private OrderStatus status = OrderStatus.RECEIVED;

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_status", nullable = false, length = 20)
	private PaymentStatus paymentStatus = PaymentStatus.PENDING;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal total = BigDecimal.ZERO;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderLine> items = new ArrayList<>();

	protected RestaurantOrder() { }

	public RestaurantOrder(String orderNumber, UserAccount customer, String customerName, int tableNumber) {
		this.orderNumber = orderNumber;
		this.customer = customer;
		this.customerName = customerName;
		this.tableNumber = tableNumber;
	}

	public void addItem(OrderLine item) {
		items.add(item);
		item.setOrder(this);
		total = total.add(item.getLineTotal());
	}

	public void setStatus(OrderStatus status) { this.status = status; }
	public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
	public UUID getId() { return id; }
	public String getOrderNumber() { return orderNumber; }
	public UserAccount getCustomer() { return customer; }
	public String getCustomerName() { return customerName; }
	public int getTableNumber() { return tableNumber; }
	public OrderStatus getStatus() { return status; }
	public PaymentStatus getPaymentStatus() { return paymentStatus; }
	public BigDecimal getTotal() { return total; }
	public Instant getCreatedAt() { return createdAt; }
	public List<OrderLine> getItems() { return List.copyOf(items); }
}
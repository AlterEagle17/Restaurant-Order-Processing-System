package com.restaurant.app;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments", uniqueConstraints = @UniqueConstraint(columnNames = "order_id"))
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(optional = false) @JoinColumn(name = "order_id", nullable = false, unique = true) private RestaurantOrder order;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method", nullable = false, length = 24) private PaymentMethod method;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PaymentStatus status = PaymentStatus.COMPLETED;
    @Column(name = "paid_at", nullable = false, updatable = false) private Instant paidAt = Instant.now();
    protected Payment() {}
    public Payment(RestaurantOrder order, PaymentMethod method) { this.order = order; this.amount = order.getTotal(); this.method = method; }
    public Long getId() { return id; }
    public RestaurantOrder getOrder() { return order; }
    public BigDecimal getAmount() { return amount; }
    public PaymentMethod getMethod() { return method; }
    public PaymentStatus getStatus() { return status; }
    public Instant getPaidAt() { return paidAt; }
}
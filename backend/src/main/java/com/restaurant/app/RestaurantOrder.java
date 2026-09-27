package com.restaurant.app;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class RestaurantOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "table_number", nullable = false) private Integer tableNumber;
    @ManyToOne(optional = false) @JoinColumn(name = "customer_id") private AppUser customer;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private OrderStatus status = OrderStatus.PENDING;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal total;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) private List<OrderItem> items = new ArrayList<>();
    protected RestaurantOrder() {}
    public RestaurantOrder(Integer tableNumber, AppUser customer) { this.tableNumber = tableNumber; this.customer = customer; this.total = BigDecimal.ZERO; }
    public Long getId() { return id; }
    public Integer getTableNumber() { return tableNumber; }
    public AppUser getCustomer() { return customer; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
    public void addItem(OrderItem item) { items.add(item); item.setOrder(this); }
}
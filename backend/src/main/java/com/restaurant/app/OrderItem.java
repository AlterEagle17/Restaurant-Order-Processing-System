package com.restaurant.app;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "order_id") private RestaurantOrder order;
    @ManyToOne(optional = false) @JoinColumn(name = "menu_item_id") private MenuItem menuItem;
    @Column(nullable = false) private Integer quantity;
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2) private BigDecimal unitPrice;
    protected OrderItem() {}
    public OrderItem(MenuItem menuItem, Integer quantity, BigDecimal unitPrice) { this.menuItem = menuItem; this.quantity = quantity; this.unitPrice = unitPrice; }
    public Long getId() { return id; }
    public RestaurantOrder getOrder() { return order; }
    public void setOrder(RestaurantOrder order) { this.order = order; }
    public MenuItem getMenuItem() { return menuItem; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
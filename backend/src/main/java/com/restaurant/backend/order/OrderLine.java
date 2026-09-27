package com.restaurant.backend.order;

import java.math.BigDecimal;
import java.util.UUID;

import com.restaurant.backend.menu.MenuItem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_items")
public class OrderLine {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "order_id", nullable = false)
	private RestaurantOrder order;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "menu_item_id", nullable = false)
	private MenuItem menuItem;

	@Column(nullable = false)
	private int quantity;

	@Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "line_total", nullable = false, precision = 12, scale = 2)
	private BigDecimal lineTotal;

	protected OrderLine() { }

	public OrderLine(MenuItem menuItem, int quantity) {
		this.menuItem = menuItem;
		this.quantity = quantity;
		this.unitPrice = menuItem.getPrice();
		this.lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
	}

	void setOrder(RestaurantOrder order) { this.order = order; }
	public UUID getId() { return id; }
	public MenuItem getMenuItem() { return menuItem; }
	public int getQuantity() { return quantity; }
	public BigDecimal getUnitPrice() { return unitPrice; }
	public BigDecimal getLineTotal() { return lineTotal; }
}
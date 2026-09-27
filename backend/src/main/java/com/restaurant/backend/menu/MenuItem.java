package com.restaurant.backend.menu;

import java.math.BigDecimal;
import java.util.UUID;

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
@Table(name = "menu_items")
public class MenuItem {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(length = 1000)
	private String description;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private MenuCategory category;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Column(name = "image_url", length = 1000)
	private String imageUrl;

	@Column(nullable = false)
	private boolean active = true;

	protected MenuItem() { }

	public MenuItem(String name, String description, MenuCategory category, BigDecimal price, String imageUrl) {
		this.name = name;
		this.description = description;
		this.category = category;
		this.price = price;
		this.imageUrl = imageUrl;
	}

	public void update(String name, String description, MenuCategory category, BigDecimal price, String imageUrl) {
		this.name = name;
		this.description = description;
		this.category = category;
		this.price = price;
		this.imageUrl = imageUrl;
	}

	public void setActive(boolean active) { this.active = active; }
	public UUID getId() { return id; }
	public String getName() { return name; }
	public String getDescription() { return description; }
	public MenuCategory getCategory() { return category; }
	public BigDecimal getPrice() { return price; }
	public String getImageUrl() { return imageUrl; }
	public boolean isActive() { return active; }
}
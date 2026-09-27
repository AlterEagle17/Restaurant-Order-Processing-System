package com.restaurant.backend.menu;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_categories")
public class MenuCategory {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, unique = true, length = 80)
	private String name;

	@Column(length = 500)
	private String description;

	@Column(nullable = false)
	private boolean active = true;

	protected MenuCategory() { }

	public MenuCategory(String name, String description) {
		this.name = name;
		this.description = description;
	}

	public void update(String name, String description, boolean active) {
		this.name = name;
		this.description = description;
		this.active = active;
	}

	public UUID getId() { return id; }
	public String getName() { return name; }
	public String getDescription() { return description; }
	public boolean isActive() { return active; }
}
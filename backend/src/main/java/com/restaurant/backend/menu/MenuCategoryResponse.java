package com.restaurant.backend.menu;

import java.util.UUID;

public record MenuCategoryResponse(UUID id, String name, String description, boolean active) {
	public static MenuCategoryResponse from(MenuCategory category) {
		return new MenuCategoryResponse(category.getId(), category.getName(), category.getDescription(), category.isActive());
	}
}
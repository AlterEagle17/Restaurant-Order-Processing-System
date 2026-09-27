package com.restaurant.backend.menu;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuItemResponse(UUID id, String name, String description, UUID categoryId,
		String categoryName, BigDecimal price, String imageUrl, boolean active) {
	public static MenuItemResponse from(MenuItem item) {
		return new MenuItemResponse(item.getId(), item.getName(), item.getDescription(), item.getCategory().getId(),
				item.getCategory().getName(), item.getPrice(), item.getImageUrl(), item.isActive());
	}
}
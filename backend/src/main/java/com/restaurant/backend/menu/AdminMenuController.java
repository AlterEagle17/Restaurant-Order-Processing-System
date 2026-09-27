package com.restaurant.backend.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.common.PageResponse;

@RestController
@RequestMapping("/api/admin/menu")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminMenuController {
	private final MenuService menuService;

	public AdminMenuController(MenuService menuService) { this.menuService = menuService; }

	@GetMapping("/categories")
	public List<MenuCategoryResponse> categories() { return menuService.allCategoriesForAdmin(); }

	@GetMapping("/items")
	public PageResponse<MenuItemResponse> items(@RequestParam(required = false) UUID categoryId,
			@RequestParam(required = false) String query, @RequestParam(required = false) Boolean active,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
		Page<MenuItemResponse> result = menuService.allItemsForAdmin(categoryId, query, active, page, size);
		return PageResponse.from(result, item -> item);
	}
}
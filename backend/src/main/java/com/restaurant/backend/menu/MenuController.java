package com.restaurant.backend.menu;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/menu")
@Validated
public class MenuController {
	private final MenuService menuService;

	public MenuController(MenuService menuService) { this.menuService = menuService; }

	@GetMapping("/categories")
	public List<MenuCategoryResponse> categories() { return menuService.categories(); }

	@GetMapping("/items")
	public PageResponse<MenuItemResponse> items(@RequestParam(required = false) UUID categoryId,
			@RequestParam(required = false) String query, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "24") int size) {
		Page<MenuItemResponse> result = menuService.items(categoryId, query, page, size);
		return PageResponse.from(result, item -> item);
	}

	@GetMapping("/items/{id}")
	public MenuItemResponse item(@PathVariable UUID id) { return menuService.item(id); }

	@PostMapping("/categories")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<MenuCategoryResponse> createCategory(@Valid @RequestBody MenuCategoryRequest request) {
		MenuCategoryResponse category = menuService.createCategory(request);
		return ResponseEntity.created(URI.create("/api/menu/categories/" + category.id())).body(category);
	}

	@PutMapping("/categories/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public MenuCategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody MenuCategoryUpdateRequest request) {
		return menuService.updateCategory(id, request);
	}

	@DeleteMapping("/categories/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
		menuService.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/items")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<MenuItemResponse> createItem(@Valid @RequestBody MenuItemRequest request) {
		MenuItemResponse item = menuService.createItem(request);
		return ResponseEntity.created(URI.create("/api/menu/items/" + item.id())).body(item);
	}

	@PutMapping("/items/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public MenuItemResponse updateItem(@PathVariable UUID id, @Valid @RequestBody MenuItemRequest request) {
		return menuService.updateItem(id, request);
	}

	@PatchMapping("/items/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public MenuItemResponse setItemActive(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
		return menuService.setItemActive(id, request.active());
	}

	public record StatusRequest(@jakarta.validation.constraints.NotNull Boolean active) { }
}
package com.restaurant.backend.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.ConflictException;
import com.restaurant.backend.common.PageRequests;
import com.restaurant.backend.common.ResourceNotFoundException;

@Service
public class MenuService {
	private final MenuCategoryRepository categoryRepository;
	private final MenuItemRepository itemRepository;

	public MenuService(MenuCategoryRepository categoryRepository, MenuItemRepository itemRepository) {
		this.categoryRepository = categoryRepository;
		this.itemRepository = itemRepository;
	}

	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> categories() {
		return categoryRepository.findAllByActiveTrueOrderByNameAsc().stream().map(MenuCategoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public Page<MenuItemResponse> items(UUID categoryId, String query, int page, int size) {
		Page<MenuItem> result;
		String normalized = query == null ? "" : query.trim();
		if (categoryId != null && !normalized.isEmpty()) {
			result = itemRepository.findByCategoryIdAndNameContainingIgnoreCaseAndActiveTrue(categoryId, normalized, PageRequests.of(page, size));
		} else if (categoryId != null) {
			result = itemRepository.findByCategoryIdAndActiveTrue(categoryId, PageRequests.of(page, size));
		} else if (!normalized.isEmpty()) {
			result = itemRepository.findByNameContainingIgnoreCaseAndActiveTrue(normalized, PageRequests.of(page, size));
		} else {
			result = itemRepository.findByActiveTrue(PageRequests.of(page, size));
		}
		return result.map(MenuItemResponse::from);
	}

	@Transactional(readOnly = true)
	public MenuItemResponse item(UUID id) {
		MenuItem item = itemRepository.findById(id).filter(MenuItem::isActive)
				.orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
		return MenuItemResponse.from(item);
	}

	@Transactional
	public MenuCategoryResponse createCategory(MenuCategoryRequest request) {
		if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) throw new ConflictException("Category name already exists");
		return MenuCategoryResponse.from(categoryRepository.save(new MenuCategory(request.name().trim(), request.description())));
	}

	@Transactional
	public MenuCategoryResponse updateCategory(UUID id, MenuCategoryUpdateRequest request) {
		MenuCategory category = requireCategory(id);
		if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) throw new ConflictException("Category name already exists");
		category.update(request.name().trim(), request.description(), request.active());
		return MenuCategoryResponse.from(category);
	}

	@Transactional
	public MenuItemResponse createItem(MenuItemRequest request) {
		MenuCategory category = requireCategory(request.categoryId());
		if (!category.isActive()) throw new com.restaurant.backend.common.BusinessRuleException("Cannot add an item to an inactive category");
		return MenuItemResponse.from(itemRepository.save(toItem(request, category)));
	}

	@Transactional
	public MenuItemResponse updateItem(UUID id, MenuItemRequest request) {
		MenuItem item = itemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
		MenuCategory category = requireCategory(request.categoryId());
		if (!category.isActive()) throw new com.restaurant.backend.common.BusinessRuleException("Cannot use an inactive category");
		item.update(request.name().trim(), request.description(), category, request.price(), request.imageUrl());
		return MenuItemResponse.from(item);
	}

	@Transactional
	public MenuItemResponse setItemActive(UUID id, boolean active) {
		MenuItem item = itemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
		item.setActive(active);
		return MenuItemResponse.from(item);
	}

	private MenuItem toItem(MenuItemRequest request, MenuCategory category) {
		return new MenuItem(request.name().trim(), request.description(), category, request.price(), request.imageUrl());
	}

	private MenuCategory requireCategory(UUID id) {
		return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu category not found"));
	}
}
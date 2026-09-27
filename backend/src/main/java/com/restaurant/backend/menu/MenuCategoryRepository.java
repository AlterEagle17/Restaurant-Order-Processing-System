package com.restaurant.backend.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, UUID> {
	List<MenuCategory> findAllByActiveTrueOrderByNameAsc();
	boolean existsByNameIgnoreCase(String name);
	boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
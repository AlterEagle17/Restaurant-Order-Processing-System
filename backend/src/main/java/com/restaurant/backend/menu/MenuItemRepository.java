package com.restaurant.backend.menu;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
	Page<MenuItem> findByActiveTrue(Pageable pageable);
	Page<MenuItem> findByCategoryIdAndActiveTrue(UUID categoryId, Pageable pageable);
	Page<MenuItem> findByNameContainingIgnoreCaseAndActiveTrue(String query, Pageable pageable);
	Page<MenuItem> findByCategoryIdAndNameContainingIgnoreCaseAndActiveTrue(UUID categoryId, String query, Pageable pageable);
	boolean existsByCategoryIdAndActiveTrue(UUID categoryId);
	@Query("select item from MenuItem item where item.active = true and item.category.active = true and item.id in :ids")
	List<MenuItem> findAllByActiveTrueAndIdIn(@Param("ids") List<UUID> ids);
	@Query("select item from MenuItem item where (:categoryId is null or item.category.id = :categoryId) and (:query is null or lower(item.name) like lower(concat('%', :query, '%'))) and (:active is null or item.active = :active)")
	Page<MenuItem> searchAll(@Param("categoryId") UUID categoryId, @Param("query") String query,
			@Param("active") Boolean active, Pageable pageable);
	@Query("select item from MenuItem item where item.active = true and item.category.active = true and (:categoryId is null or item.category.id = :categoryId) and (:query is null or lower(item.name) like lower(concat('%', :query, '%')) or lower(coalesce(item.description, '')) like lower(concat('%', :query, '%')))")
	Page<MenuItem> searchActive(@Param("categoryId") UUID categoryId, @Param("query") String query, Pageable pageable);
}
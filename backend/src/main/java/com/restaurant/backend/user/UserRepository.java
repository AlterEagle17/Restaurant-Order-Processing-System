package com.restaurant.backend.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {
	Optional<UserAccount> findByUsernameIgnoreCase(String username);
	boolean existsByUsernameIgnoreCase(String username);
	long countByRoleAndActiveTrue(Role role);
	@Query("select u from UserAccount u where (:query is null or lower(u.username) like lower(concat('%', :query, '%')) or lower(u.displayName) like lower(concat('%', :query, '%'))) and (:role is null or u.role = :role) and (:active is null or u.active = :active)")
	Page<UserAccount> search(@Param("query") String query, @Param("role") Role role,
			@Param("active") Boolean active, Pageable pageable);
}
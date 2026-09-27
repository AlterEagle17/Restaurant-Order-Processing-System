package com.restaurant.backend.user;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
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
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminUserController {
	private final AdminUserService adminUserService;

	public AdminUserController(AdminUserService adminUserService) { this.adminUserService = adminUserService; }

	@GetMapping
	public PageResponse<UserResponse> list(@RequestParam(required = false) String query,
			@RequestParam(required = false) Role role, @RequestParam(required = false) Boolean active,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
		Page<UserResponse> users = adminUserService.list(query, role, active, page, size);
		return PageResponse.from(users, user -> user);
	}

	@PostMapping
	public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
		return ResponseEntity.status(201).body(adminUserService.create(request));
	}

	@PutMapping("/{id}")
	public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
		return adminUserService.update(id, request);
	}

	@PatchMapping("/{id}/status")
	public UserResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request,
			@AuthenticationPrincipal UserDetails actor) {
		return adminUserService.updateStatus(id, request.active(), actor.getUsername());
	}

	@PatchMapping("/{id}/role")
	public UserResponse updateRole(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request,
			@AuthenticationPrincipal UserDetails actor) {
		return adminUserService.updateRole(id, request.role(), actor.getUsername());
	}

	@PatchMapping("/{id}/password")
	public ResponseEntity<Void> resetPassword(@PathVariable UUID id, @Valid @RequestBody PasswordResetRequest request) {
		adminUserService.resetPassword(id, request.newPassword());
		return ResponseEntity.noContent().build();
	}
}
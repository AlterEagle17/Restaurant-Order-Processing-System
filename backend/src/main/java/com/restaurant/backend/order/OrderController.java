package com.restaurant.backend.order;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.common.PageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@Validated
public class OrderController {
	private final OrderService orderService;

	public OrderController(OrderService orderService) { this.orderService = orderService; }

	@PostMapping
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request,
			@AuthenticationPrincipal UserDetails principal) {
		return ResponseEntity.status(201).body(orderService.create(request, principal.getUsername()));
	}

	@GetMapping("/my-orders")
	@PreAuthorize("hasRole('CUSTOMER')")
	public PageResponse<OrderResponse> myOrders(@AuthenticationPrincipal UserDetails principal,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
		Page<OrderResponse> orders = orderService.myOrders(principal.getUsername(), page, size);
		return PageResponse.from(orders, order -> order);
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER','WAITER','KITCHEN_STAFF')")
	public PageResponse<OrderResponse> list(@RequestParam(required = false) OrderStatus status,
			@RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
		Page<OrderResponse> orders = orderService.search(status, from, to, page, size);
		return PageResponse.from(orders, order -> order);
	}

	@GetMapping("/{id}")
	public OrderResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserDetails principal) {
		boolean staff = principal.getAuthorities().stream().anyMatch(authority -> !authority.getAuthority().equals("ROLE_CUSTOMER"));
		return orderService.get(id, principal.getUsername(), staff);
	}
}
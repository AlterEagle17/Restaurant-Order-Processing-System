package com.restaurant.backend.waiter;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.order.OrderResponse;
import com.restaurant.backend.order.OrderService;
import com.restaurant.backend.order.OrderStatus;
import com.restaurant.backend.common.BusinessRuleException;

@RestController
@RequestMapping("/api/waiter/orders")
@PreAuthorize("hasRole('WAITER')")
public class WaiterController {
	private final OrderService orderService;

	public WaiterController(OrderService orderService) { this.orderService = orderService; }

	@GetMapping
	public List<OrderResponse> orders(@RequestParam(required = false) OrderStatus status) {
		if (status != null && status != OrderStatus.READY && status != OrderStatus.SERVED) {
			throw new BusinessRuleException("Waiter queue supports READY and SERVED orders only");
		}
		return status == null ? orderService.queue(List.of(OrderStatus.READY, OrderStatus.SERVED)) : orderService.ordersWithStatus(status);
	}

	@PatchMapping("/{id}/serve")
	public OrderResponse serve(@PathVariable UUID id) { return orderService.serve(id); }
}
package com.restaurant.backend.kitchen;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.order.OrderResponse;
import com.restaurant.backend.order.OrderService;
import com.restaurant.backend.order.OrderStatus;
import com.restaurant.backend.common.BusinessRuleException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/kitchen/orders")
@PreAuthorize("hasRole('KITCHEN_STAFF')")
@Validated
public class KitchenController {
	private final OrderService orderService;

	public KitchenController(OrderService orderService) { this.orderService = orderService; }

	@GetMapping
	public List<OrderResponse> orders(@RequestParam(required = false) OrderStatus status) {
		if (status != null && !List.of(OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY).contains(status)) {
			throw new BusinessRuleException("Kitchen queue supports RECEIVED, PREPARING, and READY orders only");
		}
		return status == null
				? orderService.queue(List.of(OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY))
				: orderService.ordersWithStatus(status);
	}

	@PatchMapping("/{id}/status")
	public OrderResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
		return orderService.updateKitchenStatus(id, request.status());
	}

	public record StatusRequest(@NotNull OrderStatus status) { }
}
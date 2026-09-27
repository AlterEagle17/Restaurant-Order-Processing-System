package com.restaurant.backend.manager;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.backend.common.PageResponse;
import com.restaurant.backend.order.OrderResponse;
import com.restaurant.backend.order.OrderService;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {
	private final ManagerService managerService;
	private final OrderService orderService;

	public ManagerController(ManagerService managerService, OrderService orderService) {
		this.managerService = managerService;
		this.orderService = orderService;
	}

	@GetMapping("/dashboard")
	public ManagerDashboardResponse dashboard(@RequestParam(required = false) LocalDate date,
			@RequestParam(required = false) LocalDate from, @RequestParam(required = false) LocalDate to) {
		if (from != null || to != null) {
			if (date != null) throw new com.restaurant.backend.common.BusinessRuleException("Use date or from/to, not both");
			return managerService.dashboardRange(from, to);
		}
		return managerService.dashboard(date);
	}

	@GetMapping("/revenue")
	public RevenueResponse revenue(@RequestParam LocalDate from, @RequestParam LocalDate to) {
		return managerService.revenue(from, to);
	}

	@GetMapping("/orders")
	public PageResponse<OrderResponse> orders(@RequestParam(required = false) LocalDate from,
			@RequestParam(required = false) LocalDate to, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "25") int size) {
		Page<OrderResponse> orders = orderService.search(null, from, to, page, size);
		return PageResponse.from(orders, order -> order);
	}
}
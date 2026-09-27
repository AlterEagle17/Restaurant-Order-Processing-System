package com.restaurant.backend.manager;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ManagerDashboardResponse(LocalDate date, LocalDate from, LocalDate to,
		BigDecimal totalRevenue, long totalOrders, BigDecimal averageOrderValue) { }
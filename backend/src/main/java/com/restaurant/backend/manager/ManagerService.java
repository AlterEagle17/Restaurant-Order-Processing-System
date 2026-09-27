package com.restaurant.backend.manager;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.BusinessRuleException;
import com.restaurant.backend.order.OrderRepository;

@Service
public class ManagerService {
	private final OrderRepository orderRepository;

	public ManagerService(OrderRepository orderRepository) { this.orderRepository = orderRepository; }

	@Transactional(readOnly = true)
	public ManagerDashboardResponse dashboard(LocalDate date) {
		LocalDate reportDate = date == null ? LocalDate.now(ZoneOffset.UTC) : date;
		var from = reportDate.atStartOfDay().toInstant(ZoneOffset.UTC);
		var to = reportDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
		BigDecimal revenue = orderRepository.sumPaidBetween(from, to);
		long orders = orderRepository.countPaidBetween(from, to);
		BigDecimal average = orders == 0 ? BigDecimal.ZERO.setScale(2) : revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP);
		return new ManagerDashboardResponse(reportDate, revenue, orders, average);
	}

	@Transactional(readOnly = true)
	public RevenueResponse revenue(LocalDate from, LocalDate to) {
		if (from == null || to == null) throw new BusinessRuleException("from and to dates are required");
		if (to.isBefore(from)) throw new BusinessRuleException("to must be on or after from");
		if (to.isAfter(from.plusDays(92))) throw new BusinessRuleException("Date range cannot exceed 93 days");
		List<RevenuePoint> points = new ArrayList<>();
		for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
			var start = date.atStartOfDay().toInstant(ZoneOffset.UTC);
			var end = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
			points.add(new RevenuePoint(date, orderRepository.sumPaidBetween(start, end)));
		}
		return new RevenueResponse(from, to, points);
	}
}
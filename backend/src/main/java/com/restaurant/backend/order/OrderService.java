package com.restaurant.backend.order;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.BusinessRuleException;
import com.restaurant.backend.common.PageRequests;
import com.restaurant.backend.common.ResourceNotFoundException;
import com.restaurant.backend.menu.MenuItem;
import com.restaurant.backend.menu.MenuItemRepository;
import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@Service
public class OrderService {
	private final OrderRepository orderRepository;
	private final UserRepository userRepository;
	private final MenuItemRepository menuItemRepository;

	public OrderService(OrderRepository orderRepository, UserRepository userRepository, MenuItemRepository menuItemRepository) {
		this.orderRepository = orderRepository;
		this.userRepository = userRepository;
		this.menuItemRepository = menuItemRepository;
	}

	@Transactional
	public OrderResponse create(CreateOrderRequest request, String username) {
		UserAccount customer = requireUser(username);
		Set<UUID> ids = new HashSet<>();
		for (CreateOrderItemRequest item : request.items()) {
			if (!ids.add(item.menuItemId())) throw new BusinessRuleException("An item may only appear once in an order");
		}
		List<MenuItem> menuItems = menuItemRepository.findAllByActiveTrueAndIdIn(List.copyOf(ids));
		if (menuItems.size() != ids.size()) throw new BusinessRuleException("One or more menu items are unavailable");
		Map<UUID, MenuItem> itemsById = new HashMap<>();
		menuItems.forEach(item -> itemsById.put(item.getId(), item));
		RestaurantOrder order = new RestaurantOrder("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(), customer, request.tableNumber());
		for (CreateOrderItemRequest requested : request.items()) {
			order.addItem(new OrderLine(itemsById.get(requested.menuItemId()), requested.quantity()));
		}
		return OrderResponse.from(orderRepository.save(order));
	}

	@Transactional(readOnly = true)
	public Page<OrderResponse> myOrders(String username, int page, int size) {
		UserAccount customer = requireUser(username);
		return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId(), PageRequests.of(page, size)).map(OrderResponse::from);
	}

	@Transactional(readOnly = true)
	public Page<OrderResponse> search(OrderStatus status, LocalDate from, LocalDate to, int page, int size) {
		if (from != null && to != null && to.isBefore(from)) throw new BusinessRuleException("to must be on or after from");
		Instant fromTime = from == null ? null : from.atStartOfDay().toInstant(ZoneOffset.UTC);
		Instant toTime = to == null ? null : to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
		return orderRepository.search(status, fromTime, toTime, PageRequests.of(page, size)).map(OrderResponse::from);
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> queue(List<OrderStatus> statuses) {
		return orderRepository.findAllByStatusInOrderByCreatedAtAsc(statuses).stream().map(OrderResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> ordersWithStatus(OrderStatus status) {
		return orderRepository.findAllByStatusOrderByCreatedAtAsc(status).stream().map(OrderResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> cashierPending() {
		return orderRepository.findAllByStatusAndPaymentStatusOrderByCreatedAtAsc(OrderStatus.SERVED,
				com.restaurant.backend.payment.PaymentStatus.PENDING).stream().map(OrderResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderResponse get(UUID id, String username, boolean staffAccess) {
		RestaurantOrder order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
		if (!staffAccess && !order.getCustomer().getUsername().equalsIgnoreCase(username)) {
			throw new ResourceNotFoundException("Order not found");
		}
		return OrderResponse.from(order);
	}

	@Transactional
	public OrderResponse updateKitchenStatus(UUID id, OrderStatus nextStatus) {
		RestaurantOrder order = requireOrder(id);
		boolean valid = (order.getStatus() == OrderStatus.RECEIVED && nextStatus == OrderStatus.PREPARING)
				|| (order.getStatus() == OrderStatus.PREPARING && nextStatus == OrderStatus.READY);
		if (!valid) throw new BusinessRuleException("Kitchen status must advance RECEIVED → PREPARING → READY");
		order.setStatus(nextStatus);
		return OrderResponse.from(order);
	}

	@Transactional
	public OrderResponse serve(UUID id) {
		RestaurantOrder order = requireOrder(id);
		if (order.getStatus() != OrderStatus.READY) throw new BusinessRuleException("Only READY orders can be served");
		order.setStatus(OrderStatus.SERVED);
		return OrderResponse.from(order);
	}

	@Transactional
	public RestaurantOrder lockOrder(UUID id) { return orderRepository.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Order not found")); }

	private RestaurantOrder requireOrder(UUID id) {
		return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
	}

	private UserAccount requireUser(String username) {
		return userRepository.findByUsernameIgnoreCase(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}
}
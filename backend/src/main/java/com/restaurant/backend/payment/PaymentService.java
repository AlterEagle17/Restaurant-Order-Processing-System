package com.restaurant.backend.payment;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurant.backend.common.BusinessRuleException;
import com.restaurant.backend.common.ConflictException;
import com.restaurant.backend.common.PageRequests;
import com.restaurant.backend.common.ResourceNotFoundException;
import com.restaurant.backend.order.OrderService;
import com.restaurant.backend.order.OrderStatus;
import com.restaurant.backend.order.RestaurantOrder;
import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@Service
public class PaymentService {
	private final PaymentRepository paymentRepository;
	private final OrderService orderService;
	private final UserRepository userRepository;

	public PaymentService(PaymentRepository paymentRepository, OrderService orderService, UserRepository userRepository) {
		this.paymentRepository = paymentRepository;
		this.orderService = orderService;
		this.userRepository = userRepository;
	}

	@Transactional
	public PaymentResponse pay(UUID orderId, PaymentMethod method, String cashierUsername) {
		RestaurantOrder order = orderService.lockOrder(orderId);
		if (paymentRepository.existsByOrderId(orderId)) throw new ConflictException("This order has already been paid");
		if (order.getStatus() != OrderStatus.SERVED || order.getPaymentStatus() != PaymentStatus.PENDING) {
			throw new BusinessRuleException("Only served, unpaid orders can be paid");
		}
		UserAccount cashier = userRepository.findByUsernameIgnoreCase(cashierUsername)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		PaymentRecord payment = paymentRepository.save(new PaymentRecord(order, cashier, method));
		order.setPaymentStatus(PaymentStatus.PAID);
		order.setStatus(OrderStatus.COMPLETED);
		return PaymentResponse.from(payment);
	}

	@Transactional(readOnly = true)
	public Page<PaymentResponse> history(int page, int size) {
		return paymentRepository.findAllByOrderByCreatedAtDesc(PageRequests.of(page, size)).map(PaymentResponse::from);
	}
}
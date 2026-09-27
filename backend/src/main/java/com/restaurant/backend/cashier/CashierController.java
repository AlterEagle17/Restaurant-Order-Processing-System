package com.restaurant.backend.cashier;

import java.net.URI;
import java.util.List;
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
import com.restaurant.backend.order.OrderResponse;
import com.restaurant.backend.order.OrderService;
import com.restaurant.backend.payment.CreatePaymentRequest;
import com.restaurant.backend.payment.PaymentResponse;
import com.restaurant.backend.payment.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cashier")
@PreAuthorize("hasRole('CASHIER')")
@Validated
public class CashierController {
	private final OrderService orderService;
	private final PaymentService paymentService;

	public CashierController(OrderService orderService, PaymentService paymentService) {
		this.orderService = orderService;
		this.paymentService = paymentService;
	}

	@GetMapping("/orders/pending")
	public List<OrderResponse> pendingOrders() { return orderService.cashierPending(); }

	@PostMapping("/orders/{id}/payments")
	public ResponseEntity<PaymentResponse> pay(@PathVariable UUID id, @Valid @RequestBody CreatePaymentRequest request,
			@AuthenticationPrincipal UserDetails principal) {
		PaymentResponse payment = paymentService.pay(id, request.method(), principal.getUsername());
		return ResponseEntity.created(URI.create("/api/cashier/payments/" + payment.id())).body(payment);
	}

	@GetMapping("/payments")
	public PageResponse<PaymentResponse> payments(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "25") int size) {
		Page<PaymentResponse> payments = paymentService.history(page, size);
		return PageResponse.from(payments, payment -> payment);
	}
}
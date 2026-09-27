package com.restaurant.backend.payment;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentRecord, UUID> {
	boolean existsByOrderId(UUID orderId);
	Page<PaymentRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
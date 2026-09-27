package com.restaurant.backend.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

public interface OrderRepository extends JpaRepository<RestaurantOrder, UUID> {
	Page<RestaurantOrder> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);
	List<RestaurantOrder> findAllByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
	List<RestaurantOrder> findAllByStatusOrderByCreatedAtAsc(OrderStatus status);
	Optional<RestaurantOrder> findByIdAndCustomerId(UUID id, UUID customerId);
	List<RestaurantOrder> findAllByStatusAndPaymentStatusOrderByCreatedAtAsc(OrderStatus status,
			com.restaurant.backend.payment.PaymentStatus paymentStatus);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select o from RestaurantOrder o where o.id = :id")
	Optional<RestaurantOrder> findByIdForUpdate(@Param("id") UUID id);

	@Query("select o from RestaurantOrder o where (:status is null or o.status = :status) and (:fromTime is null or o.createdAt >= :fromTime) and (:toTime is null or o.createdAt < :toTime)")
	Page<RestaurantOrder> search(@Param("status") OrderStatus status, @Param("fromTime") Instant fromTime,
			@Param("toTime") Instant toTime, Pageable pageable);

	@Query("select coalesce(sum(o.total), 0) from RestaurantOrder o where o.paymentStatus = com.restaurant.backend.payment.PaymentStatus.PAID and o.createdAt >= :from and o.createdAt < :to")
	BigDecimal sumPaidBetween(@Param("from") Instant from, @Param("to") Instant to);

	@Query("select count(o) from RestaurantOrder o where o.paymentStatus = com.restaurant.backend.payment.PaymentStatus.PAID and o.createdAt >= :from and o.createdAt < :to")
	long countPaidBetween(@Param("from") Instant from, @Param("to") Instant to);

	Page<RestaurantOrder> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(Instant from, Instant to, Pageable pageable);
}
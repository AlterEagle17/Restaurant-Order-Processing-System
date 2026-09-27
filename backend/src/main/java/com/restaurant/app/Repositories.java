package com.restaurant.app;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
interface CategoryRepository extends JpaRepository<MenuCategory, Long> {}
interface MenuRepository extends JpaRepository<MenuItem, Long> { List<MenuItem> findByAvailableTrueOrderByCategoryNameAscNameAsc(); }
interface OrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findAllByOrderByCreatedAtDesc();
    List<RestaurantOrder> findByCustomerUsernameOrderByCreatedAtDesc(String username);
    List<RestaurantOrder> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
    List<RestaurantOrder> findByStatusOrderByCreatedAtAsc(OrderStatus status);
    List<RestaurantOrder> findByCreatedAtBetween(Instant from, Instant to);
}
interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByPaidAtBetweenOrderByPaidAtDesc(Instant from, Instant to);
}
package com.restaurant.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RestaurantServiceTest {
    private OrderRepository orders;
    private RestaurantService service;
    private RestaurantOrder order;

    @BeforeEach void setUp() {
        UserRepository users = mock(UserRepository.class);
        orders = mock(OrderRepository.class);
        order = new RestaurantOrder(8, new AppUser("guest", "guest@example.invalid", "hash", UserRole.CUSTOMER));
        when(orders.findById(1L)).thenReturn(Optional.of(order));
        service = new RestaurantService(users, mock(CategoryRepository.class), mock(MenuRepository.class), orders,
                mock(PaymentRepository.class), mock(AuthenticationManager.class), new JwtService("unit-test-only-secret-key-value-longer-than-32", 30), new BCryptPasswordEncoder());
    }

    @Test void kitchenAndWaiterAdvanceOnlyTheExpectedWorkflow() {
        assertEquals(OrderStatus.PREPARING, service.updateStatus(1L, OrderStatus.PREPARING, UserRole.KITCHEN_STAFF).status());
        assertEquals(OrderStatus.READY, service.updateStatus(1L, OrderStatus.READY, UserRole.KITCHEN_STAFF).status());
        assertEquals(OrderStatus.SERVED, service.updateStatus(1L, OrderStatus.SERVED, UserRole.WAITER).status());
    }

    @Test void rejectsSkippingTheKitchenPreparationStep() {
        assertThrows(ResponseStatusException.class, () -> service.updateStatus(1L, OrderStatus.READY, UserRole.KITCHEN_STAFF));
        assertEquals(OrderStatus.PENDING, order.getStatus());
    }
}
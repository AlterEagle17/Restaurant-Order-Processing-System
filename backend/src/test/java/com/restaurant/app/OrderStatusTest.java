package com.restaurant.app;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderStatusTest {
    @Test void workflowStatusesAreRepresented() {
        assertEquals(OrderStatus.PENDING, OrderStatus.valueOf("PENDING"));
        assertEquals(OrderStatus.PREPARING, OrderStatus.valueOf("PREPARING"));
        assertEquals(OrderStatus.READY, OrderStatus.valueOf("READY"));
        assertEquals(OrderStatus.SERVED, OrderStatus.valueOf("SERVED"));
        assertEquals(OrderStatus.PAID, OrderStatus.valueOf("PAID"));
    }
}
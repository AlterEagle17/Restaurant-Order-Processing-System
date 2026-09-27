package com.restaurant.app;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ApiModels {
    private ApiModels() {}
    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record UserView(Long id, String username, String email, UserRole role, boolean active, Instant createdAt) {}
    public record LoginResponse(String token, UserView user) {}
    public record CreateUserRequest(@NotBlank @Size(min=3, max=60) String username, @NotBlank @Email @Size(max=160) String email, @NotBlank @Size(min=12, max=100) String password, @NotNull UserRole role) {}
    public record UpdateUserRequest(@NotBlank @Size(min=3, max=60) String username, @NotBlank @Email @Size(max=160) String email, @NotNull UserRole role, boolean active, @Size(min=12, max=100) String password) {}
    public record CategoryView(Long id, String name, String description) {}
    public record MenuView(Long id, String name, String description, String imageUrl, BigDecimal price, boolean available, CategoryView category) {}
    public record CategoryRequest(@NotBlank @Size(max=80) String name, @Size(max=240) String description) {}
    public record MenuRequest(@NotBlank @Size(max=120) String name, @NotBlank @Size(max=500) String description, @Size(max=500) String imageUrl, @NotNull @DecimalMin("0.01") @Digits(integer=8, fraction=2) BigDecimal price, @NotNull Long categoryId, boolean available) {}
    public record OrderLineRequest(@NotNull Long menuItemId, @NotNull @Min(1) @Max(50) Integer quantity) {}
    public record OrderRequest(@NotNull @Min(1) @Max(500) Integer tableNumber, @NotEmpty List<@NotNull OrderLineRequest> items) {}
    public record OrderLineView(Long menuItemId, String name, Integer quantity, BigDecimal unitPrice) {}
    public record OrderView(Long id, Integer tableNumber, Long customerId, String customer, OrderStatus status, BigDecimal total, Instant createdAt, List<OrderLineView> items) {}
    public record StatusRequest(@NotNull OrderStatus status) {}
    public record PaymentRequest(@NotNull PaymentMethod method) {}
    public record PaymentView(Long id, Long orderId, BigDecimal amount, PaymentMethod method, PaymentStatus status, Instant paidAt) {}
    public record ReportView(BigDecimal revenue, long orderCount, List<PaymentView> payments) {}
    public record ErrorView(String error) {}
}
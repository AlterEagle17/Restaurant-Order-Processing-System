package com.restaurant.app;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final RestaurantService service;
    public ApiController(RestaurantService service) { this.service = service; }
    @PostMapping("/auth/login") public ApiModels.LoginResponse login(@Valid @RequestBody ApiModels.LoginRequest request) { return service.login(request); }
    @PostMapping("/auth/logout") public Map<String, String> logout() { return Map.of("message", "Logged out. Remove the token from the client."); }
    @GetMapping("/auth/me") public ApiModels.UserView me(Authentication auth) { return service.user(auth.getName()); }
    @GetMapping("/menu") public List<ApiModels.MenuView> menu(Authentication auth) { return service.menuItems(hasRole(auth, "ADMIN")); }
    @GetMapping("/categories") public List<ApiModels.CategoryView> categories() { return service.categories(); }
    @GetMapping("/admin/users") @PreAuthorize("hasRole('ADMIN')") public List<ApiModels.UserView> users() { return service.users(); }
    @PostMapping("/admin/users") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.UserView createUser(@Valid @RequestBody ApiModels.CreateUserRequest request) { return service.createUser(request); }
    @PutMapping("/admin/users/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.UserView updateUser(@PathVariable Long id, @Valid @RequestBody ApiModels.UpdateUserRequest request) { return service.updateUser(id, request); }
    @PostMapping("/admin/categories") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.CategoryView createCategory(@Valid @RequestBody ApiModels.CategoryRequest request) { return service.saveCategory(null, request); }
    @PutMapping("/admin/categories/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.CategoryView updateCategory(@PathVariable Long id, @Valid @RequestBody ApiModels.CategoryRequest request) { return service.saveCategory(id, request); }
    @PostMapping("/admin/menu") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.MenuView createMenu(@Valid @RequestBody ApiModels.MenuRequest request) { return service.saveMenu(null, request); }
    @PutMapping("/admin/menu/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ApiModels.MenuView updateMenu(@PathVariable Long id, @Valid @RequestBody ApiModels.MenuRequest request) { return service.saveMenu(id, request); }
    @DeleteMapping("/admin/menu/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('ADMIN')")
    public void deleteMenu(@PathVariable Long id) { service.removeMenu(id); }
    @PostMapping("/orders") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('CUSTOMER')")
    public ApiModels.OrderView createOrder(Authentication auth, @Valid @RequestBody ApiModels.OrderRequest request) { return service.placeOrder(auth.getName(), request); }
    @GetMapping("/orders") public List<ApiModels.OrderView> orders(Authentication auth) { return service.orderQueue(auth.getName(), role(auth)); }
    @PatchMapping("/orders/{id}/status")
    public ApiModels.OrderView status(Authentication auth, @PathVariable Long id, @Valid @RequestBody ApiModels.StatusRequest request) {
        return service.updateStatus(id, request.status(), role(auth));
    }
    @PostMapping("/orders/{id}/payments") @PreAuthorize("hasRole('CASHIER')")
    public ApiModels.PaymentView pay(@PathVariable Long id, @Valid @RequestBody ApiModels.PaymentRequest request) { return service.pay(id, request); }
    @GetMapping("/payments") @PreAuthorize("hasAnyRole('CASHIER','MANAGER','ADMIN')")
    public List<ApiModels.PaymentView> payments(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) { return service.payments(from, to); }
    @GetMapping("/reports/sales") @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ApiModels.ReportView report(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) { return service.report(from, to); }
    private static boolean hasRole(Authentication auth, String role) { return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_" + role)); }
    private static UserRole role(Authentication auth) { return UserRole.valueOf(auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")); }
}
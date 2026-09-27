package com.restaurant.app;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class RestaurantService {
    private final UserRepository users;
    private final CategoryRepository categories;
    private final MenuRepository menu;
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final AuthenticationManager auth;
    private final JwtService jwt;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;

    public RestaurantService(UserRepository users, CategoryRepository categories, MenuRepository menu, OrderRepository orders,
            PaymentRepository payments, AuthenticationManager auth, JwtService jwt,
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        this.users = users; this.categories = categories; this.menu = menu; this.orders = orders; this.payments = payments;
        this.auth = auth; this.jwt = jwt; this.encoder = encoder;
    }
    public ApiModels.LoginResponse login(ApiModels.LoginRequest request) {
        auth.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AppUser user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(request.username(), request.username()).orElseThrow();
        return new ApiModels.LoginResponse(jwt.issue(user.getUsername(), user.getRole()), userView(user));
    }
    public ApiModels.UserView user(String username) {
        return users.findByUsernameIgnoreCaseOrEmailIgnoreCase(username, username).map(RestaurantService::userView).orElseThrow(() -> notFound("User"));
    }
    public List<ApiModels.UserView> users() { return users.findAll().stream().map(RestaurantService::userView).toList(); }
    @Transactional public ApiModels.UserView createUser(ApiModels.CreateUserRequest request) {
        if (users.existsByUsernameIgnoreCase(request.username()) || users.existsByEmailIgnoreCase(request.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email already exists");
        return userView(users.save(new AppUser(request.username(), request.email(), encoder.encode(request.password()), request.role())));
    }
    @Transactional public ApiModels.UserView updateUser(Long id, ApiModels.UpdateUserRequest request) {
        AppUser user = users.findById(id).orElseThrow(() -> notFound("User"));
        if (users.existsByUsernameIgnoreCaseAndIdNot(request.username(), id) || users.existsByEmailIgnoreCaseAndIdNot(request.email(), id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email already exists");
        user.setUsername(request.username()); user.setEmail(request.email()); user.setRole(request.role()); user.setActive(request.active());
        if (request.password() != null && !request.password().isBlank()) user.setPasswordHash(encoder.encode(request.password()));
        return userView(user);
    }
    public List<ApiModels.CategoryView> categories() { return categories.findAll().stream().map(RestaurantService::categoryView).toList(); }
    @Transactional public ApiModels.CategoryView saveCategory(Long id, ApiModels.CategoryRequest request) {
        MenuCategory category = id == null ? new MenuCategory(request.name(), request.description()) : categories.findById(id).orElseThrow(() -> notFound("Category"));
        category.setName(request.name()); category.setDescription(request.description()); return categoryView(categories.save(category));
    }
    public List<ApiModels.MenuView> menuItems(boolean includeUnavailable) {
        return (includeUnavailable ? menu.findAll() : menu.findByAvailableTrueOrderByCategoryNameAscNameAsc()).stream().map(RestaurantService::menuView).toList();
    }
    @Transactional public ApiModels.MenuView saveMenu(Long id, ApiModels.MenuRequest request) {
        MenuCategory category = categories.findById(request.categoryId()).orElseThrow(() -> notFound("Category"));
        MenuItem item = id == null ? new MenuItem(request.name(), request.description(), request.imageUrl(), request.price(), category)
                : menu.findById(id).orElseThrow(() -> notFound("Menu item"));
        item.setName(request.name()); item.setDescription(request.description()); item.setImageUrl(request.imageUrl());
        item.setPrice(request.price()); item.setCategory(category); item.setAvailable(request.available()); return menuView(menu.save(item));
    }
    @Transactional public void removeMenu(Long id) {
        MenuItem item = menu.findById(id).orElseThrow(() -> notFound("Menu item"));
        item.setAvailable(false);
    }
    @Transactional public ApiModels.OrderView placeOrder(String username, ApiModels.OrderRequest request) {
        AppUser customer = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(username, username).orElseThrow(() -> notFound("Customer"));
        if (customer.getRole() != UserRole.CUSTOMER) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customers can place orders");
        RestaurantOrder order = new RestaurantOrder(request.tableNumber(), customer); BigDecimal total = BigDecimal.ZERO;
        for (ApiModels.OrderLineRequest line : request.items()) {
            MenuItem item = menu.findById(line.menuItemId()).orElseThrow(() -> notFound("Menu item"));
            if (!item.isAvailable()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, item.getName() + " is unavailable");
            order.addItem(new OrderItem(item, line.quantity(), item.getPrice()));
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        order.setTotal(total); return orderView(orders.save(order));
    }
    public List<ApiModels.OrderView> orderQueue(String username, UserRole role) {
        List<RestaurantOrder> rows;
        if (role == UserRole.CUSTOMER) rows = orders.findByCustomerUsernameOrderByCreatedAtDesc(username);
        else if (role == UserRole.KITCHEN_STAFF) rows = orders.findByStatusInOrderByCreatedAtAsc(List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY));
        else if (role == UserRole.WAITER) rows = orders.findByStatusOrderByCreatedAtAsc(OrderStatus.READY);
        else if (role == UserRole.CASHIER) rows = orders.findByStatusOrderByCreatedAtAsc(OrderStatus.SERVED);
        else rows = orders.findAllByOrderByCreatedAtDesc();
        return rows.stream().map(RestaurantService::orderView).toList();
    }
    @Transactional public ApiModels.OrderView updateStatus(Long id, OrderStatus next, UserRole role) {
        RestaurantOrder order = orders.findById(id).orElseThrow(() -> notFound("Order"));
        boolean allowed = (role == UserRole.KITCHEN_STAFF && ((order.getStatus() == OrderStatus.PENDING && next == OrderStatus.PREPARING) || (order.getStatus() == OrderStatus.PREPARING && next == OrderStatus.READY)))
                || (role == UserRole.WAITER && order.getStatus() == OrderStatus.READY && next == OrderStatus.SERVED);
        if (!allowed) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid order status transition for this role");
        order.setStatus(next); return orderView(order);
    }
    @Transactional public ApiModels.PaymentView pay(Long id, ApiModels.PaymentRequest request) {
        RestaurantOrder order = orders.findById(id).orElseThrow(() -> notFound("Order"));
        if (order.getStatus() != OrderStatus.SERVED) throw new ResponseStatusException(HttpStatus.CONFLICT, "Only served orders can be paid");
        if (payments.findByOrderId(id).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Order already has a payment");
        order.setStatus(OrderStatus.PAID); return paymentView(payments.save(new Payment(order, request.method())));
    }
    public List<ApiModels.PaymentView> payments(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must not be before start date");
        return payments.findByPaidAtBetweenOrderByPaidAtDesc(from.atStartOfDay().toInstant(ZoneOffset.UTC), to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC))
                .stream().map(RestaurantService::paymentView).toList();
    }
    public ApiModels.ReportView report(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must not be before start date");
        List<ApiModels.PaymentView> rows = payments(from, to);
        BigDecimal revenue = rows.stream().map(ApiModels.PaymentView::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = orders.findByCreatedAtBetween(from.atStartOfDay().toInstant(ZoneOffset.UTC), to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)).size();
        return new ApiModels.ReportView(revenue, count, rows);
    }
    static ApiModels.UserView userView(AppUser u) { return new ApiModels.UserView(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.isActive(), u.getCreatedAt()); }
    static ApiModels.CategoryView categoryView(MenuCategory c) { return new ApiModels.CategoryView(c.getId(), c.getName(), c.getDescription()); }
    static ApiModels.MenuView menuView(MenuItem i) { return new ApiModels.MenuView(i.getId(), i.getName(), i.getDescription(), i.getImageUrl(), i.getPrice(), i.isAvailable(), categoryView(i.getCategory())); }
    static ApiModels.OrderView orderView(RestaurantOrder o) { return new ApiModels.OrderView(o.getId(), o.getTableNumber(), o.getCustomer().getId(), o.getCustomer().getUsername(), o.getStatus(), o.getTotal(), o.getCreatedAt(), o.getItems().stream().map(i -> new ApiModels.OrderLineView(i.getMenuItem().getId(), i.getMenuItem().getName(), i.getQuantity(), i.getUnitPrice())).toList()); }
    static ApiModels.PaymentView paymentView(Payment p) { return new ApiModels.PaymentView(p.getId(), p.getOrder().getId(), p.getAmount(), p.getMethod(), p.getStatus(), p.getPaidAt()); }
    private static ResponseStatusException notFound(String type) { return new ResponseStatusException(HttpStatus.NOT_FOUND, type + " not found"); }
}
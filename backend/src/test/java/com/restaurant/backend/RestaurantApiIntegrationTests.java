package com.restaurant.backend;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import com.restaurant.backend.menu.MenuCategory;
import com.restaurant.backend.menu.MenuCategoryRepository;
import com.restaurant.backend.menu.MenuItem;
import com.restaurant.backend.menu.MenuItemRepository;
import com.restaurant.backend.order.OrderRepository;
import com.restaurant.backend.payment.PaymentRepository;
import com.restaurant.backend.user.Role;
import com.restaurant.backend.user.UserAccount;
import com.restaurant.backend.user.UserRepository;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:restaurant-api;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=validate",
		"spring.flyway.enabled=true",
		"app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
@AutoConfigureMockMvc
class RestaurantApiIntegrationTests {
	@Autowired private MockMvc mockMvc;
	@Autowired private UserRepository userRepository;
	@Autowired private MenuCategoryRepository categoryRepository;
	@Autowired private MenuItemRepository itemRepository;
	@Autowired private OrderRepository orderRepository;
	@Autowired private PaymentRepository paymentRepository;
	@Autowired private PasswordEncoder passwordEncoder;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@BeforeEach
	void cleanDatabase() {
		paymentRepository.deleteAll();
		orderRepository.deleteAll();
		itemRepository.deleteAll();
		categoryRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void loginCurrentUserAndRoleAccessAreEnforced() throws Exception {
		createUser("admin", Role.ADMIN);
		createUser("customer", Role.CUSTOMER);
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.error").value("UNAUTHORIZED"));

		String customerToken = login("customer");
		mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(customerToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("customer"))
				.andExpect(jsonPath("$.role").value("CUSTOMER"));
		mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(customerToken)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.error").value("FORBIDDEN"));
		mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(customerToken + "tampered")))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/menu/categories"))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/menu/items"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").isArray());
	}

	@Test
	void orderUsesDatabasePricesAndCompletesTransactionalPaymentWorkflow() throws Exception {
		createUser("customer", Role.CUSTOMER);
		createUser("kitchen", Role.KITCHEN_STAFF);
		createUser("waiter", Role.WAITER);
		createUser("cashier", Role.CASHIER);
		createUser("manager", Role.MANAGER);
		MenuCategory category = categoryRepository.save(new MenuCategory("Mains", "Kitchen favorites"));
		MenuItem menuItem = itemRepository.save(new MenuItem("Pasta", "Fresh pasta", category,
				new BigDecimal("12.50"), null));
		mockMvc.perform(get("/api/menu/items").param("categoryId", category.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].name").value("Pasta"));
		String customerToken = login("customer");
		String kitchenToken = login("kitchen");
		String waiterToken = login("waiter");
		String cashierToken = login("cashier");
		String managerToken = login("manager");

		MvcResult created = mockMvc.perform(post("/api/orders")
				.header("Authorization", bearer(customerToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"tableNumber\":4,\"total\":0.01,\"items\":[{\"menuItemId\":\"" + menuItem.getId()
						+ "\",\"quantity\":2,\"unitPrice\":0.01}]}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.total").value(25.0))
				.andExpect(jsonPath("$.items[0].unitPrice").value(12.5))
				.andExpect(jsonPath("$.paymentStatus").value("PENDING"))
				.andReturn();
		String orderId = readField(created, "id");
		mockMvc.perform(patch("/api/kitchen/orders/{id}/status", orderId)
				.header("Authorization", bearer(kitchenToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"status\":\"READY\"}"))
				.andExpect(status().isUnprocessableEntity());
		mockMvc.perform(patch("/api/waiter/orders/{id}/serve", orderId)
				.header("Authorization", bearer(waiterToken)))
				.andExpect(status().isUnprocessableEntity());

		mockMvc.perform(patch("/api/kitchen/orders/{id}/status", orderId)
				.header("Authorization", bearer(kitchenToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"status\":\"PREPARING\"}"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PREPARING"));
		mockMvc.perform(patch("/api/kitchen/orders/{id}/status", orderId)
				.header("Authorization", bearer(kitchenToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"status\":\"READY\"}"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.status").value("READY"));
		mockMvc.perform(patch("/api/waiter/orders/{id}/serve", orderId)
				.header("Authorization", bearer(waiterToken)))
				.andExpect(status().isOk()).andExpect(jsonPath("$.status").value("SERVED"));
		MockHttpServletRequestBuilder payment = post("/api/cashier/orders/{id}/payments", orderId)
				.header("Authorization", bearer(cashierToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"method\":\"CASH\"}");
		mockMvc.perform(payment)
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.amount").value(25.0))
				.andExpect(jsonPath("$.status").value("PAID"));
		mockMvc.perform(payment)
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.error").value("CONFLICT"));

		String date = LocalDate.now(ZoneOffset.UTC).toString();
		mockMvc.perform(get("/api/manager/dashboard").param("date", date)
				.header("Authorization", bearer(managerToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalRevenue").value(25.0))
				.andExpect(jsonPath("$.totalOrders").value(1))
				.andExpect(jsonPath("$.averageOrderValue").value(25.0));
		mockMvc.perform(get("/api/manager/revenue").param("from", date).param("to", date)
				.header("Authorization", bearer(managerToken)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.points[0].revenue").value(25.0));
	}

	@Test
	void adminCanManageUsersAndCatalogWithoutReturningPasswordHashes() throws Exception {
		createUser("admin", Role.ADMIN);
		String adminToken = login("admin");
		MvcResult userResult = mockMvc.perform(post("/api/admin/users")
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"username\":\"new-staff\",\"password\":\"Password123456\",\"displayName\":\"New Staff\",\"role\":\"WAITER\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.username").value("new-staff"))
				.andExpect(jsonPath("$.passwordHash").doesNotExist())
				.andReturn();
		String newUserId = readField(userResult, "id");
		mockMvc.perform(post("/api/admin/users")
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"username\":\"NEW-STAFF\",\"password\":\"Password123456\",\"displayName\":\"Duplicate\",\"role\":\"WAITER\"}"))
				.andExpect(status().isConflict());
		mockMvc.perform(patch("/api/admin/users/{id}/password", newUserId)
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"newPassword\":\"ChangedPass123\"}"))
				.andExpect(status().isNoContent());
		mockMvc.perform(patch("/api/admin/users/{id}/status", newUserId)
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"active\":false}"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"username\":\"new-staff\",\"password\":\"ChangedPass123\"}"))
				.andExpect(status().isUnauthorized());

		MvcResult categoryResult = mockMvc.perform(post("/api/menu/categories")
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Desserts\",\"description\":\"Sweet things\"}"))
				.andExpect(status().isCreated()).andReturn();
		String categoryId = readField(categoryResult, "id");
		mockMvc.perform(post("/api/menu/items")
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Invalid price\",\"categoryId\":\"" + categoryId + "\",\"price\":0}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
		MvcResult itemResult = mockMvc.perform(post("/api/menu/items")
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Pudding\",\"categoryId\":\"" + categoryId + "\",\"price\":6.25}"))
				.andExpect(status().isCreated()).andReturn();
		String itemId = readField(itemResult, "id");
		mockMvc.perform(patch("/api/menu/items/{id}/status", itemId)
				.header("Authorization", bearer(adminToken)).contentType(MediaType.APPLICATION_JSON)
				.content("{\"active\":false}"))
				.andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
		mockMvc.perform(get("/api/menu/items/{id}", itemId)).andExpect(status().isNotFound());
	}

	@Test
	void inactiveAccountCannotAuthenticate() throws Exception {
		UserAccount user = createUser("disabled", Role.CUSTOMER);
		user.setActive(false);
		userRepository.save(user);
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"username\":\"disabled\",\"password\":\"Password123456\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
	}

	private UserAccount createUser(String username, Role role) {
		return userRepository.save(new UserAccount(username, passwordEncoder.encode("Password123456"), username, role));
	}

	private String login(String username) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"username\":\"" + username + "\",\"password\":\"Password123456\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken", not(blankOrNullString())))
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andReturn();
		return readField(result, "accessToken");
	}

	private String bearer(String token) { return "Bearer " + token; }

	private String readField(MvcResult result, String property) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).path(property).asText();
	}
}
package com.restaurant.backend.user;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_users")
public class UserAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, unique = true, length = 80)
	private String username;

	@Column(name = "password_hash", nullable = false, length = 100)
	private String passwordHash;

	@Column(name = "display_name", nullable = false, length = 120)
	private String displayName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 24)
	private Role role;

	@Column(nullable = false)
	private boolean active = true;

	@Column(name = "is_table_account", nullable = false)
	private boolean tableAccount;

	@Column(name = "table_number")
	private Integer tableNumber;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	protected UserAccount() { }

	public UserAccount(String username, String passwordHash, String displayName, Role role) {
		this.username = username;
		this.passwordHash = passwordHash;
		this.displayName = displayName;
		this.role = role;
		this.active = true;
	}

	public UserAccount(String username, String passwordHash, String displayName, Role role, int tableNumber) {
		this(username, passwordHash, displayName, role);
		this.tableAccount = true;
		this.tableNumber = tableNumber;
	}

	public void updateProfile(String username, String displayName) {
		this.username = username;
		this.displayName = displayName;
	}

	public void setRole(Role role) { this.role = role; }
	public void setActive(boolean active) { this.active = active; }
	public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	public UUID getId() { return id; }
	public String getUsername() { return username; }
	public String getPasswordHash() { return passwordHash; }
	public String getDisplayName() { return displayName; }
	public Role getRole() { return role; }
	public boolean isActive() { return active; }
	public boolean isTableAccount() { return tableAccount; }
	public Integer getTableNumber() { return tableNumber; }
	public Instant getCreatedAt() { return createdAt; }
}
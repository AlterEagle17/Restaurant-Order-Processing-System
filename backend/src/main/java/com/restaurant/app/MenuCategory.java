package com.restaurant.app;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_categories")
public class MenuCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 80) private String name;
    @Column(length = 240) private String description;
    protected MenuCategory() {}
    public MenuCategory(String name, String description) { this.name = name; this.description = description; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
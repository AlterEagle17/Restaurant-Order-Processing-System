package com.restaurant.app;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 500) private String description;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(nullable = false) private boolean available = true;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) @JoinColumn(name = "category_id") private MenuCategory category;
    protected MenuItem() {}
    public MenuItem(String name, String description, String imageUrl, BigDecimal price, MenuCategory category) {
        this.name = name; this.description = description; this.imageUrl = imageUrl; this.price = price; this.category = category;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public MenuCategory getCategory() { return category; }
    public void setCategory(MenuCategory category) { this.category = category; }
}
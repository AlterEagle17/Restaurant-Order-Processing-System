package com.restaurant.backend.manager;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenuePoint(LocalDate date, BigDecimal revenue) { }
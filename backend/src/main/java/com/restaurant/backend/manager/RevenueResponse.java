package com.restaurant.backend.manager;

import java.time.LocalDate;
import java.util.List;

public record RevenueResponse(LocalDate from, LocalDate to, List<RevenuePoint> points) { }
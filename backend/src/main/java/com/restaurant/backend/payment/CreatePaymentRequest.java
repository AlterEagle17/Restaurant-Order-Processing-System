package com.restaurant.backend.payment;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(@NotNull PaymentMethod method) { }
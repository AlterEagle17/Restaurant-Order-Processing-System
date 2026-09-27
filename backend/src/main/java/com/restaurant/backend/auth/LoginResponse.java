package com.restaurant.backend.auth;

public record LoginResponse(String accessToken, String tokenType, long expiresIn, AuthUserResponse user) { }
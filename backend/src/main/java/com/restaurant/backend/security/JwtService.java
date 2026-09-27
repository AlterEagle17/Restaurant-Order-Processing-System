package com.restaurant.backend.security;

import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.restaurant.backend.user.UserAccount;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	private final SecretKey key;
	private final long expirationMs;

	public JwtService(@Value("${app.jwt.secret}") String encodedSecret,
			@Value("${app.jwt.expiration-ms:900000}") long expirationMs) {
		try {
			byte[] secretBytes = Base64.getDecoder().decode(encodedSecret);
			if (secretBytes.length < 32) {
				throw new IllegalArgumentException("JWT secret must decode to at least 32 bytes");
			}
			this.key = Keys.hmacShaKeyFor(secretBytes);
		} catch (IllegalArgumentException exception) {
			throw new IllegalStateException("JWT_SECRET must be a Base64-encoded key of at least 256 bits", exception);
		}
		if (expirationMs < 60_000 || expirationMs > 86_400_000) {
			throw new IllegalStateException("JWT_EXPIRATION_MS must be between 60000 and 86400000");
		}
		this.expirationMs = expirationMs;
	}

	public String issue(UserAccount user) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(user.getUsername())
					.claim("role", user.getRole().name())
					.issuedAt(Date.from(now))
					.expiration(Date.from(now.plusMillis(expirationMs)))
					.signWith(key)
					.compact();
	}

	public Optional<String> subject(String token) {
		try {
			Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
			return Optional.ofNullable(claims.getSubject());
		} catch (JwtException | IllegalArgumentException exception) {
			return Optional.empty();
		}
	}

	public long getExpirationMs() { return expirationMs; }
}
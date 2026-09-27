package com.restaurant.backend.security;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.backend.common.ApiError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final DatabaseUserDetailsService userDetailsService;
	private final ObjectMapper objectMapper;
	private final String allowedOrigins;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
			DatabaseUserDetailsService userDetailsService,
			@Value("${app.cors.allowed-origins}") String allowedOrigins) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.userDetailsService = userDetailsService;
		this.objectMapper = new ObjectMapper().findAndRegisterModules();
		this.allowedOrigins = allowedOrigins;
	}

	@Bean
	PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }

	@Bean
	DaoAuthenticationProvider daoAuthenticationProvider(PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return provider;
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	SecurityFilterChain securityFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http,
			DaoAuthenticationProvider authenticationProvider) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authenticationProvider(authenticationProvider)
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint((request, response, exception) -> writeSecurityError(request, response,
								HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED", "Authentication required"))
						.accessDeniedHandler((request, response, exception) -> writeSecurityError(request, response,
								HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action")))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/menu/**").permitAll()
						.anyRequest().authenticated())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration cors = new CorsConfiguration();
		cors.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
				.map(String::trim).filter(origin -> !origin.isEmpty()).toList());
		cors.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "OPTIONS"));
		cors.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
		cors.setAllowCredentials(false);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", cors);
		source.registerCorsConfiguration("/actuator/**", cors);
		return source;
	}

	private void writeSecurityError(HttpServletRequest request, HttpServletResponse response, int status,
			String code, String message) throws IOException {
		response.setStatus(status);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(),
				new ApiError(Instant.now(), status, code, message, request.getRequestURI(), Map.of()));
	}
}
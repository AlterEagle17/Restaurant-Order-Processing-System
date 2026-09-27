package com.restaurant.backend.common;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	ResponseEntity<ApiError> notFound(ResourceNotFoundException exception, WebRequest request) {
		return response(HttpStatus.NOT_FOUND, "NOT_FOUND", exception.getMessage(), request, Map.of());
	}

	@ExceptionHandler(ConflictException.class)
	ResponseEntity<ApiError> conflict(ConflictException exception, WebRequest request) {
		return response(HttpStatus.CONFLICT, "CONFLICT", exception.getMessage(), request, Map.of());
	}

	@ExceptionHandler(com.restaurant.backend.auth.InvalidCredentialsException.class)
	ResponseEntity<ApiError> invalidCredentials(com.restaurant.backend.auth.InvalidCredentialsException exception,
			WebRequest request) {
		return response(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", exception.getMessage(), request, Map.of());
	}

	@ExceptionHandler(ResponseStatusException.class)
	ResponseEntity<ApiError> statusException(ResponseStatusException exception, WebRequest request) {
		HttpStatusCode status = exception.getStatusCode();
		HttpStatus resolved = HttpStatus.valueOf(status.value());
		return response(resolved, resolved.name(), exception.getReason() == null ? "Request failed" : exception.getReason(), request, Map.of());
	}

	@ExceptionHandler(BusinessRuleException.class)
	ResponseEntity<ApiError> businessRule(BusinessRuleException exception, WebRequest request) {
		return response(HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION", exception.getMessage(), request, Map.of());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception, WebRequest request) {
		Map<String, String> fields = new LinkedHashMap<>();
		for (FieldError error : exception.getBindingResult().getFieldErrors()) {
			fields.putIfAbsent(error.getField(), error.getDefaultMessage());
		}
		return response(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed", request, fields);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException exception, WebRequest request) {
		return response(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Request body is missing or invalid", request, Map.of());
	}

	@ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class,
			ConstraintViolationException.class, IllegalArgumentException.class})
	ResponseEntity<ApiError> invalidParameters(Exception exception, WebRequest request) {
		return response(HttpStatus.BAD_REQUEST, "INVALID_PARAMETER", "One or more request parameters are invalid", request, Map.of());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	ResponseEntity<ApiError> dataConflict(DataIntegrityViolationException exception, WebRequest request) {
		return response(HttpStatus.CONFLICT, "DATA_CONFLICT", "The request conflicts with existing data", request, Map.of());
	}

	private ResponseEntity<ApiError> response(HttpStatus status, String code, String message, WebRequest request,
			Map<String, String> fields) {
		String path = request instanceof ServletWebRequest servletRequest
				? servletRequest.getRequest().getRequestURI() : "";
		return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), code, message, path, fields));
	}
}
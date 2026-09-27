package com.restaurant.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiModels.ErrorView> authentication() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiModels.ErrorView("Invalid username or password"));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiModels.ErrorView> conflict() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiModels.ErrorView("A conflicting record already exists"));
    }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiModels.ErrorView> status(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(new ApiModels.ErrorView(ex.getReason()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiModels.ErrorView> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).distinct().collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(new ApiModels.ErrorView(message));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiModels.ErrorView> unexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiModels.ErrorView("Request could not be completed"));
    }
}
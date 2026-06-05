package com.hospital.appointments.controller;

import com.hospital.appointments.dto.LoginRequest;
import com.hospital.appointments.dto.LoginResponse;
import com.hospital.appointments.dto.RegisterRequest;
import com.hospital.appointments.entity.Hospital;
import com.hospital.appointments.service.AuthService;
import com.hospital.appointments.service.HospitalService;
import com.hospital.appointments.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and authentication")
public class AuthController {

    private final AuthService authService;
    private final HospitalService hospitalService;

    public AuthController(AuthService authService, HospitalService hospitalService) {
        this.authService = authService;
        this.hospitalService = hospitalService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new Patient or Doctor")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. You can now login."));
    }

    @GetMapping("/hospitals")
    @Operation(summary = "Get list of hospitals (publicly accessible for doctor registration dropdowns)")
    public ResponseEntity<ApiResponse<List<Hospital>>> getHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(ApiResponse.success("Hospitals list retrieved", hospitals));
    }
}

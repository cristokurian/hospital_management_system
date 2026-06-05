package com.hospital.appointments.dto;

import com.hospital.appointments.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    private String lastName;

    @Size(max = 20)
    private String phone;

    @NotNull(message = "Role is required")
    private Role role; // DOCTOR or PATIENT (ADMIN registration can be seeded or restricted)

    // Patient specific fields
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;

    // Doctor specific fields
    private String specialization;
    private String biography;
    private Long hospitalId; // Assumed assignable upon registration or later
}

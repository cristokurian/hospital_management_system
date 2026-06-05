package com.hospital.appointments.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;

    // Patient profile updates
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;

    // Doctor profile updates
    private String specialization;
    private String biography;
}

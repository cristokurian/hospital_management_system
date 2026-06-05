package com.hospital.appointments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HospitalRequest {
    @NotBlank(message = "Hospital name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phone;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    private String description;
}

package com.hospital.appointments.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {
    @NotNull(message = "Available slot ID is required")
    private Long slotId;

    private String notes;
}

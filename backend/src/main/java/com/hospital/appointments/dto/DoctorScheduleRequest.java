package com.hospital.appointments.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorScheduleRequest {
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Slot duration is required")
    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 30, message = "Slot duration can be at most 30 minutes")
    private Integer slotDuration; // 15 or 30

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}

package com.hospital.appointments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalHospitals;
    private long totalDoctors;
    private long totalPatients;
    private long totalAppointments;
    private Map<String, Long> statusStats;
}

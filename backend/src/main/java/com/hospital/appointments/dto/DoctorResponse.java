package com.hospital.appointments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String specialization;
    private String biography;
    private Long hospitalId;
    private String hospitalName;
    private String hospitalCity;
}

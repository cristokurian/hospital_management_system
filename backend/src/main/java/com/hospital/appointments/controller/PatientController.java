package com.hospital.appointments.controller;

import com.hospital.appointments.dto.AppointmentRequest;
import com.hospital.appointments.dto.AppointmentResponse;
import com.hospital.appointments.dto.AvailableSlotResponse;
import com.hospital.appointments.dto.ChangePasswordRequest;
import com.hospital.appointments.dto.DoctorResponse;
import com.hospital.appointments.dto.PatientResponse;
import com.hospital.appointments.dto.ProfileUpdateRequest;
import com.hospital.appointments.entity.AppointmentStatus;
import com.hospital.appointments.entity.Hospital;
import com.hospital.appointments.security.UserPrincipal;
import com.hospital.appointments.service.AppointmentService;
import com.hospital.appointments.service.DoctorService;
import com.hospital.appointments.service.HospitalService;
import com.hospital.appointments.service.PatientService;
import com.hospital.appointments.service.SlotEngineService;
import com.hospital.appointments.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Patient Operations", description = "Endpoints restricted to Patient role")
public class PatientController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final HospitalService hospitalService;
    private final SlotEngineService slotEngineService;
    private final AppointmentService appointmentService;

    public PatientController(
            PatientService patientService,
            DoctorService doctorService,
            HospitalService hospitalService,
            SlotEngineService slotEngineService,
            AppointmentService appointmentService
    ) {
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.hospitalService = hospitalService;
        this.slotEngineService = slotEngineService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get patient dashboard split by upcoming and previous appointments")
    public ResponseEntity<ApiResponse<Map<String, List<AppointmentResponse>>>> getPatientDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long patientId = userPrincipal.getId();
        List<AppointmentResponse> all = appointmentService.getPatientAppointments(patientId);
        LocalDate today = LocalDate.now();

        List<AppointmentResponse> upcoming = all.stream()
                .filter(a -> !a.getAppointmentDate().isBefore(today) && a.getStatus() != AppointmentStatus.CANCELLED)
                .collect(Collectors.toList());

        List<AppointmentResponse> previous = all.stream()
                .filter(a -> a.getAppointmentDate().isBefore(today) || 
                             a.getStatus() == AppointmentStatus.CANCELLED || 
                             a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        Map<String, List<AppointmentResponse>> dashboard = new HashMap<>();
        dashboard.put("upcoming", upcoming);
        dashboard.put("previous", previous);

        return ResponseEntity.ok(ApiResponse.success("Patient dashboard retrieved", dashboard));
    }

    // Profile Management
    @GetMapping("/profile")
    @Operation(summary = "Get current patient's profile details")
    public ResponseEntity<ApiResponse<PatientResponse>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        PatientResponse response = patientService.getPatientResponseById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile details retrieved", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current patient's profile details")
    public ResponseEntity<ApiResponse<PatientResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        PatientResponse response = patientService.updatePatientProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password for the authenticated patient")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        patientService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // Doctor & Hospital Search
    @GetMapping("/hospitals")
    @Operation(summary = "List all hospitals (for dropdown selectors)")
    public ResponseEntity<ApiResponse<List<Hospital>>> getHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(ApiResponse.success("Hospitals list retrieved", hospitals));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Search doctors by name, specialization, or hospital assignment")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> searchDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Long hospitalId
    ) {
        List<DoctorResponse> response = doctorService.searchDoctors(query, specialization, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Doctors matching search criteria", response));
    }

    @GetMapping("/doctors/{doctorId}/slots")
    @Operation(summary = "Get unbooked and unblocked time slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<AvailableSlotResponse>>> getDoctorAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date
    ) {
        List<AvailableSlotResponse> response = slotEngineService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved successfully", response));
    }

    // Appointment Operations
    @PostMapping("/appointments")
    @Operation(summary = "Book an available appointment slot")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AppointmentRequest request
    ) {
        AppointmentResponse response = appointmentService.bookAppointment(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully. Awaiting doctor approval.", response));
    }

    @PutMapping("/appointments/{appointmentId}/reschedule")
    @Operation(summary = "Reschedule an existing appointment to a new slot")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long appointmentId,
            @RequestParam Long newSlotId
    ) {
        AppointmentResponse response = appointmentService.rescheduleAppointment(
                userPrincipal.getId(), appointmentId, newSlotId);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully. Awaiting doctor approval.", response));
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    @Operation(summary = "Cancel a booked appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long appointmentId
    ) {
        AppointmentResponse response = appointmentService.cancelAppointment(userPrincipal.getId(), appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", response));
    }
}

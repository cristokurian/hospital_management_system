package com.hospital.appointments.controller;

import com.hospital.appointments.dto.*;
import com.hospital.appointments.entity.AppointmentStatus;
import com.hospital.appointments.security.UserPrincipal;
import com.hospital.appointments.service.AppointmentService;
import com.hospital.appointments.service.DoctorService;
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
@RequestMapping("/api/doctor")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Doctor Operations", description = "Endpoints restricted to Doctor role")
public class DoctorController {

    private final SlotEngineService slotEngineService;
    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public DoctorController(
            SlotEngineService slotEngineService, 
            AppointmentService appointmentService,
            DoctorService doctorService,
            PatientService patientService
    ) {
        this.slotEngineService = slotEngineService;
        this.appointmentService = appointmentService;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get doctor dashboard split by today, upcoming and completed appointments")
    public ResponseEntity<ApiResponse<Map<String, List<AppointmentResponse>>>> getDoctorDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long doctorId = userPrincipal.getId();
        List<AppointmentResponse> all = appointmentService.getDoctorAppointments(doctorId);
        LocalDate today = LocalDate.now();

        List<AppointmentResponse> todayAppointments = all.stream()
                .filter(a -> a.getAppointmentDate().equals(today) && a.getStatus() != AppointmentStatus.CANCELLED)
                .collect(Collectors.toList());

        List<AppointmentResponse> upcomingAppointments = all.stream()
                .filter(a -> a.getAppointmentDate().isAfter(today) && 
                             a.getStatus() != AppointmentStatus.CANCELLED && 
                             a.getStatus() != AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        List<AppointmentResponse> completedAppointments = all.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        Map<String, List<AppointmentResponse>> dashboard = new HashMap<>();
        dashboard.put("today", todayAppointments);
        dashboard.put("upcoming", upcomingAppointments);
        dashboard.put("completed", completedAppointments);

        return ResponseEntity.ok(ApiResponse.success("Doctor dashboard statistics retrieved", dashboard));
    }

    // Profile Management
    @GetMapping("/profile")
    @Operation(summary = "Get current doctor's profile details")
    public ResponseEntity<ApiResponse<DoctorResponse>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        DoctorResponse response = doctorService.getDoctorResponseById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile details retrieved", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current doctor's profile details")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        DoctorResponse response = doctorService.updateDoctorProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password for the authenticated doctor")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        patientService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // Schedule Management
    @GetMapping("/schedules")
    @Operation(summary = "View schedules configured by current Doctor")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedules(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<DoctorScheduleResponse> response = slotEngineService.getSchedulesByDoctor(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Doctor schedules retrieved", response));
    }

    @PostMapping("/schedules")
    @Operation(summary = "Create or modify daily schedule configuration (triggers slot generation)")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createOrUpdateSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DoctorScheduleRequest request
    ) {
        DoctorScheduleResponse response = slotEngineService.createOrUpdateSchedule(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Schedule saved successfully", response));
    }

    @DeleteMapping("/schedules/{id}")
    @Operation(summary = "Remove weekly schedule configuration (clears future unbooked slots)")
    public ResponseEntity<ApiResponse<Object>> deleteSchedule(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id
    ) {
        slotEngineService.deleteSchedule(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully"));
    }

    // Slot Blocking Control
    @PutMapping("/slots/{slotId}/block")
    @Operation(summary = "Block or unblock specific booking slot")
    public ResponseEntity<ApiResponse<Object>> toggleBlockSlot(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long slotId,
            @RequestParam boolean blocked
    ) {
        slotEngineService.toggleSlotBlock(userPrincipal.getId(), slotId, blocked);
        String msg = blocked ? "Slot blocked successfully" : "Slot unblocked successfully";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    @GetMapping("/slots/date")
    @Operation(summary = "List all slots generated for doctor on a specific date (including blocked and booked)")
    public ResponseEntity<ApiResponse<List<AvailableSlotResponse>>> getDoctorSlotsByDate(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam LocalDate date
    ) {
        List<AvailableSlotResponse> slots = slotEngineService.getAllSlotsForDoctorAndDate(userPrincipal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success("Slots list retrieved", slots));
    }

    // Appointment Management
    @GetMapping("/appointments")
    @Operation(summary = "Get list of all appointments for Doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<AppointmentResponse> response = appointmentService.getDoctorAppointments(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Appointments list retrieved", response));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    @Operation(summary = "Approve, cancel, or complete patient appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long appointmentId,
            @RequestParam AppointmentStatus status
    ) {
        AppointmentResponse response = appointmentService.updateAppointmentStatus(
                userPrincipal.getId(), appointmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated to " + status, response));
    }
}

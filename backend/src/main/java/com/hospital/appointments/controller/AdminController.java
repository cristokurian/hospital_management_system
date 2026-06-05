package com.hospital.appointments.controller;
import com.hospital.appointments.dto.AppointmentResponse;
import com.hospital.appointments.dto.AdminDashboardResponse;
import com.hospital.appointments.dto.HospitalRequest;
import com.hospital.appointments.dto.PatientResponse;
import com.hospital.appointments.dto.DoctorResponse;
import com.hospital.appointments.entity.Hospital;
import com.hospital.appointments.service.AppointmentService;
import com.hospital.appointments.service.DoctorService;
import com.hospital.appointments.service.HospitalService;
import com.hospital.appointments.service.PatientService;
import com.hospital.appointments.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Operations", description = "Endpoints restricted to Administrator role")
public class AdminController {

    private final AppointmentService appointmentService;
    private final HospitalService hospitalService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public AdminController(
            AppointmentService appointmentService,
            HospitalService hospitalService,
            DoctorService doctorService,
            PatientService patientService
    ) {
        this.appointmentService = appointmentService;
        this.hospitalService = hospitalService;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get administrator dashboard KPI analytics statistics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboardStats() {
        AdminDashboardResponse response = appointmentService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", response));
    }

    // Hospital CRUD Management
    @GetMapping("/hospitals")
    @Operation(summary = "List all registered hospitals")
    public ResponseEntity<ApiResponse<List<Hospital>>> listHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(ApiResponse.success("Hospitals list retrieved", hospitals));
    }

    @PostMapping("/hospitals")
    @Operation(summary = "Add a new hospital facility branch")
    public ResponseEntity<ApiResponse<Hospital>> addHospital(@Valid @RequestBody HospitalRequest request) {
        Hospital hospital = hospitalService.createHospital(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital created successfully", hospital));
    }

    @PutMapping("/hospitals/{id}")
    @Operation(summary = "Modify hospital branch details")
    public ResponseEntity<ApiResponse<Hospital>> updateHospital(
            @PathVariable Long id, 
            @Valid @RequestBody HospitalRequest request
    ) {
        Hospital hospital = hospitalService.updateHospital(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", hospital));
    }

    @DeleteMapping("/hospitals/{id}")
    @Operation(summary = "Delete hospital branch facility")
    public ResponseEntity<ApiResponse<Object>> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted successfully"));
    }

    // Doctor Management
    @PutMapping("/doctors/{doctorId}/assign")
    @Operation(summary = "Assign a Doctor to a Hospital facility")
    public ResponseEntity<ApiResponse<DoctorResponse>> assignDoctor(
            @PathVariable Long doctorId,
            @RequestParam(required = false) Long hospitalId
    ) {
        DoctorResponse response = doctorService.assignHospital(doctorId, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Doctor assigned to hospital successfully", response));
    }

    @DeleteMapping("/doctors/{doctorId}")
    @Operation(summary = "Remove doctor profile and access credentials")
    public ResponseEntity<ApiResponse<Object>> deleteDoctor(@PathVariable Long doctorId) {
        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile removed successfully"));
    }

    // Patient Management
    @GetMapping("/patients")
    @Operation(summary = "Search registered patients by query (first/last name, email, phone)")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> listPatients(@RequestParam(required = false) String query) {
        List<PatientResponse> response = patientService.searchPatients(query);
        return ResponseEntity.ok(ApiResponse.success("Patients list retrieved", response));
    }

    @GetMapping("/patients/{patientId}/appointments")
    @Operation(summary = "Get appointment history for a specific patient")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPatientAppointments(@PathVariable Long patientId) {
        List<AppointmentResponse> response = appointmentService.getPatientAppointments(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient appointment history retrieved", response));
    }
}

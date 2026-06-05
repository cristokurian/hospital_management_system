package com.hospital.appointments.service;

import com.hospital.appointments.dto.AdminDashboardResponse;
import com.hospital.appointments.dto.AppointmentRequest;
import com.hospital.appointments.dto.AppointmentResponse;
import com.hospital.appointments.entity.*;
import com.hospital.appointments.exception.BadRequestException;
import com.hospital.appointments.exception.ResourceNotFoundException;
import com.hospital.appointments.exception.SlotNotAvailableException;
import com.hospital.appointments.repository.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailableSlotRepository availableSlotRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AvailableSlotRepository availableSlotRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            HospitalRepository hospitalRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.availableSlotRepository = availableSlotRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(Long patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        AvailableSlot slot = availableSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Available slot not found with id: " + request.getSlotId()));

        if (slot.getIsBooked() || slot.getIsBlocked()) {
            throw new SlotNotAvailableException("This slot is no longer available.");
        }

        try {
            // Book the slot
            slot.setIsBooked(true);
            availableSlotRepository.save(slot);

            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .doctor(slot.getDoctor())
                    .slot(slot)
                    .appointmentDate(slot.getDate())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .status(AppointmentStatus.PENDING)
                    .notes(request.getNotes())
                    .build();

            Appointment saved = appointmentRepository.save(appointment);
            return mapToResponse(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            // Concurrent booking detected
            throw new SlotNotAvailableException("This slot was booked by another patient just now. Please select another slot.");
        } catch (Exception ex) {
            throw new BadRequestException("Failed to book appointment: " + ex.getMessage());
        }
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(Long patientId, Long appointmentId, Long newSlotId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new BadRequestException("You do not have permission to reschedule this appointment.");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot reschedule a completed or cancelled appointment.");
        }

        AvailableSlot newSlot = availableSlotRepository.findById(newSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("New slot not found with id: " + newSlotId));

        if (newSlot.getIsBooked() || newSlot.getIsBlocked()) {
            throw new SlotNotAvailableException("The new slot is not available.");
        }

        try {
            // Free the old slot
            AvailableSlot oldSlot = appointment.getSlot();
            oldSlot.setIsBooked(false);
            availableSlotRepository.save(oldSlot);

            // Book the new slot
            newSlot.setIsBooked(true);
            availableSlotRepository.save(newSlot);

            // Update appointment
            appointment.setSlot(newSlot);
            appointment.setAppointmentDate(newSlot.getDate());
            appointment.setStartTime(newSlot.getStartTime());
            appointment.setEndTime(newSlot.getEndTime());
            appointment.setStatus(AppointmentStatus.PENDING); // Needs re-approval from doctor
            
            Appointment saved = appointmentRepository.save(appointment);
            return mapToResponse(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new SlotNotAvailableException("The new slot was booked by another user. Please choose another slot.");
        }
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        // Security check: Either the booking Patient or the Doctor can cancel it
        if (!appointment.getPatient().getId().equals(userId) && !appointment.getDoctor().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to cancel this appointment.");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment.");
        }

        // Release the slot
        AvailableSlot slot = appointment.getSlot();
        slot.setIsBooked(false);
        availableSlotRepository.save(slot);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long doctorId, Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You do not have permission to manage this appointment.");
        }

        if (status == AppointmentStatus.CANCELLED) {
            // If doctor cancels, we release the slot
            AvailableSlot slot = appointment.getSlot();
            slot.setIsBooked(false);
            availableSlotRepository.save(slot);
        }

        appointment.setStatus(status);
        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AdminDashboardResponse getAdminDashboardStats() {
        long totalHospitals = hospitalRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();
        long totalAppointments = appointmentRepository.count();

        List<Map<String, Object>> statusRaw = appointmentRepository.countAppointmentsByStatus();
        Map<String, Long> statusStats = new HashMap<>();
        
        // Initialize stats maps with 0 for standard statuses
        statusStats.put("PENDING", 0L);
        statusStats.put("APPROVED", 0L);
        statusStats.put("CANCELLED", 0L);
        statusStats.put("COMPLETED", 0L);

        for (Map<String, Object> row : statusRaw) {
            Object statusObj = row.get("status");
            Object countObj = row.get("count");
            if (statusObj != null && countObj != null) {
                statusStats.put(statusObj.toString(), ((Number) countObj).longValue());
            }
        }

        return AdminDashboardResponse.builder()
                .totalHospitals(totalHospitals)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalAppointments(totalAppointments)
                .statusStats(statusStats)
                .build();
    }

    public AppointmentResponse mapToResponse(Appointment a) {
        String docName = "Dr. " + a.getDoctor().getUser().getFirstName() + " " + a.getDoctor().getUser().getLastName();
        String patName = a.getPatient().getUser().getFirstName() + " " + a.getPatient().getUser().getLastName();
        
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(patName)
                .patientEmail(a.getPatient().getUser().getEmail())
                .patientPhone(a.getPatient().getUser().getPhone())
                .doctorId(a.getDoctor().getId())
                .doctorName(docName)
                .specialization(a.getDoctor().getSpecialization())
                .hospitalId(a.getDoctor().getHospital() != null ? a.getDoctor().getHospital().getId() : null)
                .hospitalName(a.getDoctor().getHospital() != null ? a.getDoctor().getHospital().getName() : "Unassigned")
                .hospitalCity(a.getDoctor().getHospital() != null ? a.getDoctor().getHospital().getCity() : "")
                .slotId(a.getSlot().getId())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .build();
    }
}

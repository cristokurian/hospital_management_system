package com.hospital.appointments.service;

import com.hospital.appointments.dto.AvailableSlotResponse;
import com.hospital.appointments.dto.DoctorScheduleRequest;
import com.hospital.appointments.dto.DoctorScheduleResponse;
import com.hospital.appointments.entity.AvailableSlot;
import com.hospital.appointments.entity.Doctor;
import com.hospital.appointments.entity.DoctorSchedule;
import com.hospital.appointments.exception.BadRequestException;
import com.hospital.appointments.exception.ResourceNotFoundException;
import com.hospital.appointments.repository.AvailableSlotRepository;
import com.hospital.appointments.repository.DoctorRepository;
import com.hospital.appointments.repository.DoctorScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotEngineService {

    private final DoctorScheduleRepository scheduleRepository;
    private final AvailableSlotRepository availableSlotRepository;
    private final DoctorRepository doctorRepository;

    public SlotEngineService(
            DoctorScheduleRepository scheduleRepository,
            AvailableSlotRepository availableSlotRepository,
            DoctorRepository doctorRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.availableSlotRepository = availableSlotRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DoctorScheduleResponse> getSchedulesByDoctor(Long doctorId) {
        return scheduleRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorScheduleResponse createOrUpdateSchedule(Long doctorId, DoctorScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        // Check if schedule for this day of week already exists
        DoctorSchedule schedule = scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, request.getDayOfWeek())
                .orElse(null);

        if (schedule == null) {
            schedule = DoctorSchedule.builder()
                    .doctor(doctor)
                    .dayOfWeek(request.getDayOfWeek())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .slotDuration(request.getSlotDuration())
                    .isActive(request.getIsActive())
                    .build();
        } else {
            // Delete all future unbooked slots for this schedule before updating
            availableSlotRepository.deleteUnbookedSlotsByScheduleId(schedule.getId());
            
            schedule.setStartTime(request.getStartTime());
            schedule.setEndTime(request.getEndTime());
            schedule.setSlotDuration(request.getSlotDuration());
            schedule.setIsActive(request.getIsActive());
        }

        DoctorSchedule saved = scheduleRepository.save(schedule);

        if (saved.getIsActive()) {
            generateSlotsForSchedule(saved);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void generateSlotsForSchedule(DoctorSchedule schedule) {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(14); // Generate for 2 weeks in advance
        Doctor doctor = schedule.getDoctor();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (date.getDayOfWeek() == schedule.getDayOfWeek()) {
                LocalTime current = schedule.getStartTime();
                LocalTime scheduleEnd = schedule.getEndTime();
                int duration = schedule.getSlotDuration();

                while (current.plusMinutes(duration).isBefore(scheduleEnd) || current.plusMinutes(duration).equals(scheduleEnd)) {
                    LocalTime slotEnd = current.plusMinutes(duration);

                    // Check duplicate
                    boolean exists = availableSlotRepository.existsByDoctorIdAndDateAndStartTime(
                            doctor.getId(), date, current);

                    if (!exists) {
                        AvailableSlot slot = AvailableSlot.builder()
                                .doctor(doctor)
                                .schedule(schedule)
                                .date(date)
                                .startTime(current)
                                .endTime(slotEnd)
                                .isBooked(false)
                                .isBlocked(false)
                                .build();
                        availableSlotRepository.save(slot);
                    }
                    current = slotEnd;
                }
            }
        }
    }

    @Transactional
    public void deleteSchedule(Long doctorId, Long scheduleId) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        if (!schedule.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You do not have permission to delete this schedule.");
        }

        // Delete all future unbooked slots generated by this schedule
        availableSlotRepository.deleteUnbookedSlotsByScheduleId(scheduleId);
        scheduleRepository.delete(schedule);
    }

    public List<AvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        List<AvailableSlot> slots = availableSlotRepository.findByDoctorIdAndDateAndIsBookedFalseAndIsBlockedFalseOrderByStartTimeAsc(doctorId, date);
        return slots.stream().map(this::mapSlotToResponse).collect(Collectors.toList());
    }

    public List<AvailableSlotResponse> getAllSlotsForDoctorAndDate(Long doctorId, LocalDate date) {
        List<AvailableSlot> slots = availableSlotRepository.findByDoctorIdAndDate(doctorId, date);
        return slots.stream().map(this::mapSlotToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void toggleSlotBlock(Long doctorId, Long slotId, boolean blocked) {
        AvailableSlot slot = availableSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));

        if (!slot.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You do not have permission to manage this slot.");
        }

        if (slot.getIsBooked()) {
            throw new BadRequestException("Cannot block/unblock a slot that has an active booking. Cancel the appointment first.");
        }

        slot.setIsBlocked(blocked);
        availableSlotRepository.save(slot);
    }

    private DoctorScheduleResponse mapToResponse(DoctorSchedule schedule) {
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(schedule.getDoctor().getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .slotDuration(schedule.getSlotDuration())
                .isActive(schedule.getIsActive())
                .build();
    }

    private AvailableSlotResponse mapSlotToResponse(AvailableSlot slot) {
        return AvailableSlotResponse.builder()
                .id(slot.getId())
                .date(slot.getDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isBooked(slot.getIsBooked())
                .isBlocked(slot.getIsBlocked())
                .build();
    }
}

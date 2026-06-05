package com.hospital.appointments.repository;

import com.hospital.appointments.entity.AvailableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailableSlotRepository extends JpaRepository<AvailableSlot, Long> {
    
    List<AvailableSlot> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    
    List<AvailableSlot> findByDoctorIdAndDateAndIsBookedFalseAndIsBlockedFalseOrderByStartTimeAsc(Long doctorId, LocalDate date);
    
    boolean existsByDoctorIdAndDateAndStartTime(Long doctorId, LocalDate date, LocalTime startTime);
    
    @Modifying
    @Query("DELETE FROM AvailableSlot s WHERE s.schedule.id = :scheduleId AND s.isBooked = false")
    void deleteUnbookedSlotsByScheduleId(@Param("scheduleId") Long scheduleId);

    @Modifying
    @Query("DELETE FROM AvailableSlot s WHERE s.doctor.id = :doctorId AND s.date >= :date AND s.isBooked = false")
    void deleteUnbookedSlotsFromDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}

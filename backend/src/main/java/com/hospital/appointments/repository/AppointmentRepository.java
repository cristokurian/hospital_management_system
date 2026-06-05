package com.hospital.appointments.repository;

import com.hospital.appointments.entity.Appointment;
import com.hospital.appointments.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);
    
    List<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId);
    
    List<Appointment> findByDoctorIdAndAppointmentDateOrderByStartTimeAsc(Long doctorId, LocalDate date);
    
    @Query("SELECT a.status as status, COUNT(a) as count FROM Appointment a GROUP BY a.status")
    List<Map<String, Object>> countAppointmentsByStatus();
}

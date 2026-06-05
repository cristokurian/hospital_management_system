package com.hospital.appointments.repository;

import com.hospital.appointments.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE " +
           "(:query IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
           "(:hospitalId IS NULL OR d.hospital.id = :hospitalId)")
    List<Doctor> searchDoctors(
            @Param("query") String query, 
            @Param("specialization") String specialization, 
            @Param("hospitalId") Long hospitalId
    );

    List<Doctor> findByHospitalId(Long hospitalId);
}

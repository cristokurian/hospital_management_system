package com.hospital.appointments.service;

import com.hospital.appointments.dto.DoctorResponse;
import com.hospital.appointments.dto.ProfileUpdateRequest;
import com.hospital.appointments.entity.Doctor;
import com.hospital.appointments.entity.Hospital;
import com.hospital.appointments.exception.ResourceNotFoundException;
import com.hospital.appointments.repository.DoctorRepository;
import com.hospital.appointments.repository.HospitalRepository;
import com.hospital.appointments.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            HospitalRepository hospitalRepository,
            UserRepository userRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
    }

    public List<DoctorResponse> searchDoctors(String query, String specialization, Long hospitalId) {
        List<Doctor> doctors = doctorRepository.searchDoctors(query, specialization, hospitalId);
        return doctors.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public DoctorResponse getDoctorResponseById(Long id) {
        return mapToResponse(getDoctorById(id));
    }

    @Transactional
    public DoctorResponse assignHospital(Long doctorId, Long hospitalId) {
        Doctor doctor = getDoctorById(doctorId);
        Hospital hospital = null;
        if (hospitalId != null) {
            hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + hospitalId));
        }
        doctor.setHospital(hospital);
        return mapToResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponse updateDoctorProfile(Long doctorId, ProfileUpdateRequest request) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.getUser().setFirstName(request.getFirstName());
        doctor.getUser().setLastName(request.getLastName());
        doctor.getUser().setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setBiography(request.getBiography());
        return mapToResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
        userRepository.deleteById(id); // Cascade deletion of login credentials
    }

    public DoctorResponse mapToResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .email(doctor.getUser().getEmail())
                .firstName(doctor.getUser().getFirstName())
                .lastName(doctor.getUser().getLastName())
                .phone(doctor.getUser().getPhone())
                .specialization(doctor.getSpecialization())
                .biography(doctor.getBiography())
                .hospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null)
                .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : "Unassigned")
                .hospitalCity(doctor.getHospital() != null ? doctor.getHospital().getCity() : "")
                .build();
    }
}

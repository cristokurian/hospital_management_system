package com.hospital.appointments.service;

import com.hospital.appointments.dto.ChangePasswordRequest;
import com.hospital.appointments.dto.PatientResponse;
import com.hospital.appointments.dto.ProfileUpdateRequest;
import com.hospital.appointments.entity.Patient;
import com.hospital.appointments.entity.User;
import com.hospital.appointments.exception.BadRequestException;
import com.hospital.appointments.exception.ResourceNotFoundException;
import com.hospital.appointments.repository.PatientRepository;
import com.hospital.appointments.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(
            PatientRepository patientRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PatientResponse> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return getAllPatients();
        }
        return patientRepository.searchPatients(query).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public PatientResponse getPatientResponseById(Long id) {
        return mapToResponse(getPatientById(id));
    }

    @Transactional
    public PatientResponse updatePatientProfile(Long patientId, ProfileUpdateRequest request) {
        Patient patient = getPatientById(patientId);
        patient.getUser().setFirstName(request.getFirstName());
        patient.getUser().setLastName(request.getLastName());
        patient.getUser().setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        return mapToResponse(patientRepository.save(patient));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect old password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .email(patient.getUser().getEmail())
                .firstName(patient.getUser().getFirstName())
                .lastName(patient.getUser().getLastName())
                .phone(patient.getUser().getPhone())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .address(patient.getAddress())
                .build();
    }
}

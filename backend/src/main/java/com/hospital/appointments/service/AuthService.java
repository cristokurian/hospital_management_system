package com.hospital.appointments.service;

import com.hospital.appointments.dto.LoginRequest;
import com.hospital.appointments.dto.LoginResponse;
import com.hospital.appointments.dto.RegisterRequest;
import com.hospital.appointments.entity.*;
import com.hospital.appointments.exception.BadRequestException;
import com.hospital.appointments.repository.DoctorRepository;
import com.hospital.appointments.repository.HospitalRepository;
import com.hospital.appointments.repository.PatientRepository;
import com.hospital.appointments.repository.UserRepository;
import com.hospital.appointments.security.JwtTokenProvider;
import com.hospital.appointments.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            HospitalRepository hospitalRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.hospitalRepository = hospitalRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        return LoginResponse.builder()
                .token(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        if (registerRequest.getRole() == Role.ADMIN) {
            throw new BadRequestException("Self-registration of administrators is forbidden.");
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phone(registerRequest.getPhone())
                .role(registerRequest.getRole())
                .build();

        User savedUser = userRepository.save(user);

        if (registerRequest.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .id(savedUser.getId())
                    .user(savedUser)
                    .dateOfBirth(registerRequest.getDateOfBirth())
                    .gender(registerRequest.getGender())
                    .bloodGroup(registerRequest.getBloodGroup())
                    .address(registerRequest.getAddress())
                    .build();
            patientRepository.save(patient);
        } else if (registerRequest.getRole() == Role.DOCTOR) {
            Hospital hospital = null;
            if (registerRequest.getHospitalId() != null) {
                hospital = hospitalRepository.findById(registerRequest.getHospitalId())
                        .orElseThrow(() -> new BadRequestException("Specified hospital not found."));
            }

            Doctor doctor = Doctor.builder()
                    .id(savedUser.getId())
                    .user(savedUser)
                    .hospital(hospital)
                    .specialization(registerRequest.getSpecialization() != null ? registerRequest.getSpecialization() : "General Practitioner")
                    .biography(registerRequest.getBiography())
                    .build();
            doctorRepository.save(doctor);
        }
    }
}

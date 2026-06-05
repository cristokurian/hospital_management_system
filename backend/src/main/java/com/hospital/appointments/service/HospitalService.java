package com.hospital.appointments.service;

import com.hospital.appointments.dto.HospitalRequest;
import com.hospital.appointments.entity.Hospital;
import com.hospital.appointments.exception.ResourceNotFoundException;
import com.hospital.appointments.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
    }

    @Transactional
    public Hospital createHospital(HospitalRequest request) {
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .city(request.getCity())
                .description(request.getDescription())
                .build();
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public Hospital updateHospital(Long id, HospitalRequest request) {
        Hospital hospital = getHospitalById(id);
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setPhone(request.getPhone());
        hospital.setCity(request.getCity());
        hospital.setDescription(request.getDescription());
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public void deleteHospital(Long id) {
        Hospital hospital = getHospitalById(id);
        hospitalRepository.delete(hospital);
    }
}

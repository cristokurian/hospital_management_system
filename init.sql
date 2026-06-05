-- CareFlow Database Schema and Seed script

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME
) ENGINE=InnoDB;

-- 3. Doctors Table (inherits users PK)
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT PRIMARY KEY,
    hospital_id BIGINT,
    specialization VARCHAR(100) NOT NULL,
    biography TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Patients Table (inherits users PK)
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT PRIMARY KEY,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Doctor Schedules Table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Available Slots Table
CREATE TABLE IF NOT EXISTS available_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    schedule_id BIGINT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES doctor_schedules(id) ON DELETE SET NULL,
    CONSTRAINT uk_doctor_slot_time UNIQUE (doctor_id, date, start_time)
) ENGINE=InnoDB;

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL UNIQUE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES available_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- SEED DATA
-- All passwords are encrypted 'admin123' / 'doctor123' / 'patient123'
-- using the BCrypt hash: $2a$10$iZk89y7g5LzC8H22hS4BiuB.oT0sQz2L/a9wB1U0FepG78Ym3r5d6
-- ==========================================

-- Seed Hospitals
INSERT INTO hospitals (id, name, address, phone, city, description, created_at, updated_at) VALUES
(1, 'St. Jude Specialty Hospital', '501 St. Jude Place', '(800) 822-6344', 'Memphis', 'Pediatric research and treatment hospital focusing on oncology and immunology.', NOW(), NOW()),
(2, 'Mayo Medical Clinic', '200 First St SW', '(507) 284-2511', 'Rochester', 'Integrated clinical practice and medicine research branch.', NOW(), NOW());

-- Seed Users (Credentials)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, created_at, updated_at) VALUES
(1, 'admin@careflow.com', '$2a$10$iZk89y7g5LzC8H22hS4BiuB.oT0sQz2L/a9wB1U0FepG78Ym3r5d6', 'System', 'Admin', '555-0199', 'ADMIN', NOW(), NOW()),
(2, 'doctor@careflow.com', '$2a$10$iZk89y7g5LzC8H22hS4BiuB.oT0sQz2L/a9wB1U0FepG78Ym3r5d6', 'Gregory', 'House', '555-0231', 'DOCTOR', NOW(), NOW()),
(3, 'patient@careflow.com', '$2a$10$iZk89y7g5LzC8H22hS4BiuB.oT0sQz2L/a9wB1U0FepG78Ym3r5d6', 'John', 'Doe', '555-0342', 'PATIENT', NOW(), NOW());

-- Seed Doctor Details
INSERT INTO doctors (id, hospital_id, specialization, biography, created_at, updated_at) VALUES
(2, 2, 'Neurology', 'Board-certified diagnostician specializing in infectious diseases, neuroscience, and medical mystery resolutions.', NOW(), NOW());

-- Seed Patient Details
INSERT INTO patients (id, date_of_birth, gender, blood_group, address, created_at, updated_at) VALUES
(3, '1990-05-15', 'Male', 'O+', '742 Evergreen Terrace, Rochester NY', NOW(), NOW());

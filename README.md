# CareFlow - Full-Stack Hospital Appointment Management System

CareFlow is a production-ready, full-stack Hospital Appointment and Clinical Schedule Management system built with a Java Spring Boot backend, a React.js client interface styled with Tailwind CSS, and a MySQL relational database.

---

## Tech Stack

*   **Backend**: Java 21, Spring Boot 3.3.0, Spring Security (JWT), Spring Data JPA, Hibernate, Lombok, MySQL Connector, Springdoc OpenAPI (Swagger UI).
*   **Frontend**: React.js, Vite, React Router v6, Axios, Tailwind CSS v3, Lucide React (Icons).
*   **Database**: MySQL 8.0.
*   **DevOps/Deployment**: Multi-stage Dockerfiles, Docker Compose.

---

## Features By Role

### 1. Administrator
*   **KPI Dashboard**: Live counters for total clinics, active practitioners, registered patients, and appointment aggregates.
*   **Hospital Management**: Complete CRUD controls for physical medical facilities.
*   **Doctor Assignment**: Assign registered doctors to hospital branches.
*   **Patient Audits**: Search/inspect registered patient files and view their comprehensive appointment histories.

### 2. Medical Doctor
*   **Daily Practice Queue**: Tabbed listings separating today's queue, upcoming sessions, and completed history.
*   **Schedule Configuration**: Define weekly work hours (spawns 15/30-minute available booking slots for the next 14 days).
*   **Time Slot Blocking**: Interactively toggle single slots as "Blocked" or "Available" in a calendar grid.
*   **Appointment Management**: Approve patient booking requests, cancel sessions, or flag completed visits.

### 3. Patient
*   **Personal Dashboard**: Track upcoming visits and access historical consultation logs.
*   **Specialist Directory**: Search and filter doctors by name, specialty, and hospital location.
*   **Real-time Booking**: View a doctor's live calendar slots, choose an open slot, enter symptoms, and book.
*   **Rescheduling & Cancellations**: Easily move or cancel existing appointments.
*   **Profile Settings**: Update demographic details, blood group, or change passwords.

---

## Database Schema (MySQL)

We use a fully normalized relational schema:
*   `users`: Base credentials table for authentication.
*   `hospitals`: Physical hospital branch locations.
*   `doctors`: Details specialization and maps 1-to-1 with a credential user.
*   `patients`: Details demographic records and maps 1-to-1 with a credential user.
*   `doctor_schedules`: Weekly recurring work availability.
*   `available_slots`: Individual bookable calendar time blocks.
*   `appointments`: Scheduled patient-physician consultation events.

---

## Deployment & Setup

### Option A: Using Docker Compose (Recommended)
This approach launches all services (MySQL, Spring Boot API, React static client) automatically in a containerized environment.

1.  Ensure you have Docker and Docker Compose installed.
2.  In the project root directory, run:
    ```bash
    docker-compose up --build -d
    ```
3.  Access the applications:
    *   **React Web Client**: [http://localhost](http://localhost) (Port 80)
    *   **Spring Boot Swagger API Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
    *   **MySQL Server**: `localhost:3306` (Database: `hospital_db`, User: `root`, Password: `password`)

---

### Option B: Local Manual Running (Development)

#### 1. Setup Database
Create a MySQL database named `hospital_db` and run the queries inside `init.sql` to compile tables and seed mock data.

#### 2. Run Backend (Spring Boot)
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Start the Spring Boot server using the Maven wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(The backend will start on port `8080`)*

#### 3. Run Frontend (React Vite)
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    *(The React client will start on `http://localhost:5173`)*

---

## Seed Credentials for Testing

All seeded user profiles share the password: `password` (e.g. hashed using BCrypt).

*   **Administrator**: `admin@careflow.com` (Password: `password`)
*   **Medical Doctor**: `doctor@careflow.com` (Password: `password`)
*   **Patient**: `patient@careflow.com` (Password: `password`)

---

## REST API Endpoints Overview

### Authentication (Public)
*   `POST /api/auth/register` - Create Doctor/Patient credentials.
*   `POST /api/auth/login` - Sign-in and receive JWT authorization token.
*   `GET /api/auth/hospitals` - Fetch clinics list for registration dropdown selectors.

### Administrator
*   `GET /api/admin/dashboard` - Live KPIs counters and status arrays.
*   `GET/POST/PUT/DELETE /api/admin/hospitals` - Facility branch CRUD actions.
*   `PUT /api/admin/doctors/{doctorId}/assign` - Assign a doctor to a clinic.
*   `DELETE /api/admin/doctors/{doctorId}` - Delete doctor credentials.
*   `GET /api/admin/patients` - Query and search registered patients list.
*   `GET /api/admin/patients/{id}/appointments` - Access patient appointment history.

### Medical Doctor
*   `GET /api/doctor/dashboard` - Splits appointments list (today, upcoming, completed).
*   `GET/POST/DELETE /api/doctor/schedules` - Weekly availability rules setup.
*   `PUT /api/doctor/slots/{slotId}/block` - Block or release single calendar slots.
*   `GET/PUT /api/doctor/appointments` - Complete roster and status changes (Approve, Complete, Cancel).
*   `GET/PUT /api/doctor/profile` - Manage profile, specialization, and change passwords.

### Patient
*   `GET /api/patient/dashboard` - Upcoming vs previous appointment logs.
*   `GET/PUT /api/patient/profile` - Demographic inputs and password changes.
*   `GET /api/patient/doctors` - Search doctors directory with filters.
*   `GET /api/patient/doctors/{id}/slots` - View available time slots on selected date.
*   `POST /api/patient/appointments` - Book appointment slot.
*   `PUT /api/patient/appointments/{id}/reschedule` - Shift appointment to new slot.
*   `PUT /api/patient/appointments/{id}/cancel` - Cancel appointment.

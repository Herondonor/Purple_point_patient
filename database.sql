CREATE DATABASE dental_clinic;
USE dental_clinic;

CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  house_no VARCHAR(20) NOT NULL,
  street VARCHAR(50) NOT NULL,
  barangay VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  appointment_type ENUM('consultation', 'cleaning', 'filling', 'extraction', 'other') NOT NULL,
  appointment_status enum('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  reason_for_visit VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  cancel_reason TEXT DEFAULT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE dental_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  visit_date DATE NOT NULL,
  dentist VARCHAR(100),
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);
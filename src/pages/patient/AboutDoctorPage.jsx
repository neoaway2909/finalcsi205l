import React from 'react';
import { FaUser } from 'react-icons/fa';
import './AboutDoctorPage.css';

const AboutDoctorPage = ({ doctor, onBack, onBookAppointment }) => {
  if (!doctor) {
    return null;
  }

  return (
    <div className="about-doctor-page">
      <button onClick={onBack} className="btn btn-link">
        &larr; Back to Doctor List
      </button>
      
      <div className="doctor-profile-header-about">
        <div className="doctor-photo-placeholder">
          <FaUser size={48} color="#c0d1f0" />
        </div>
        <div className="info-section">
          <h2 className="name">{doctor.name}</h2>
          <p className="specialty">{doctor.specialty}</p>
          <p className="details">{doctor.hospital}</p>
        </div>
      </div>

      <div className="about-section">
        <h3>About</h3>
        <p>
          Dr. {doctor.name} is a highly respected {doctor.specialty} with over 15 years of experience. 
          Known for a compassionate approach and dedication to patient well-being, Dr. {doctor.name} is a leading expert in the field.
        </p>
      </div>

      <div className="experience-section">
        <h3>Working Experience</h3>
        <div className="experience-item">
          <strong>Senior Consultant</strong>
          <span>{doctor.hospital} (2015 - Present)</span>
        </div>
        <div className="experience-item">
          <strong>Resident Physician</strong>
          <span>General Hospital (2010 - 2015)</span>
        </div>
      </div>

      <div className="bottom-cta">
        <button onClick={onBookAppointment} className="btn btn-primary btn-lg">
          Book an Appointment
        </button>
      </div>
    </div>
  );
};

export default AboutDoctorPage;

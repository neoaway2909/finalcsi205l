import React from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * Doctor Profile Header Component
 * Displays doctor's basic information in booking page
 *
 * @param {Object} doctor - Doctor information
 * @param {string} doctor.name - Doctor's name
 * @param {string} doctor.specialty - Doctor's specialty
 * @param {string} doctor.hospital - Doctor's hospital
 */
export const DoctorProfileHeader = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <div className="doctor-profile-header">
      <div className="doctor-photo-placeholder">
        <FaUser size={48} color="#c0d1f0" />
      </div>
      <div className="info-section">
        <h2 className="name">{doctor.name}</h2>
        <p className="specialty">{doctor.specialty}</p>
        <p className="details">{doctor.hospital}</p>
      </div>
    </div>
  );
};

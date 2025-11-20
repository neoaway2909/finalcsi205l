import React from 'react';
import { FaUser } from 'react-icons/fa';
import './PatientCard.css';

const PatientCard = ({ appointment, onAddMedicalHistory, onComplete }) => {
  const { patient, date, status } = appointment;
  const { name, age, gender, reason } = patient;
  const isPast = new Date(date) < new Date();

  return (
    <div className="patient-card">
      <div className="patient-info">
        <div className="patient-photo-placeholder">
          <FaUser size={32} color="#c0d1f0" />
        </div>
        <div className="info-section">
          <p className="name">{name}</p>
          <span className="details">Age: {age}</span>
          <span className="details">Gender: {gender}</span>
          <p className="details">Reason: {reason}</p>
        </div>
      </div>
      <div className="action-buttons">
        {!isPast && status === 'scheduled' && (
          <button className="btn btn-success" onClick={() => onComplete(appointment.id)}>Complete</button>
        )}
        {isPast && status === 'completed' && (
          <button className="btn btn-primary" onClick={() => onAddMedicalHistory(appointment)}>Add Medical History</button>
        )}
      </div>
    </div>
  );
};

export default PatientCard;

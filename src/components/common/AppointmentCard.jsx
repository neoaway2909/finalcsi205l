import React from 'react';
import { FaUser } from 'react-icons/fa';
import './AppointmentCard.css';

const AppointmentCard = ({ appointment }) => {
  const { doctor, date, time } = appointment;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const now = new Date();
  const appointmentDate = new Date(date);
  const diffTime = appointmentDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const indicatorColor = diffDays <= 3 ? 'red' : 'green';

  return (
    <div className="appointment-card">
      <div className={`status-dot ${indicatorColor}`}></div>
      <div className="doctor-info">
        <div className="doctor-photo-placeholder">
          <FaUser size={32} color="#c0d1f0" />
        </div>
        <div className="info-section">
          <p className="name">{doctor.name}</p>
          <span className="specialty">{doctor.specialty}</span>
        </div>
      </div>
      <div className="appointment-details">
        <span className="date">{formattedDate}</span>
        <span className="time">{time}</span>
      </div>
    </div>
  );
};

export default AppointmentCard;

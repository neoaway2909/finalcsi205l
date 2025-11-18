import React from 'react';
import { FaUser } from 'react-icons/fa';
import { translations } from '../../constants/translations';

const BookingPage = ({ doctor, onBack, lang }) => {
  if (!doctor) {
    return (
      <div className="page-placeholder">
        <h2>{translations[lang].noDoctorSelected}</h2>
        <p>{translations[lang].noDoctorSelectedDesc}</p>
        <button onClick={onBack} className="btn btn-secondary">{translations[lang].goBack}</button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <button onClick={onBack} className="btn btn-link mb-4">
        &larr; {translations[lang].backToHome}
      </button>
      
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

      <div className="booking-calendar-container">
        <h3>{translations[lang].selectDateAndTime}</h3>
        {/* Placeholder for a calendar component */}
        <div className="calendar-placeholder">
          <p>{translations[lang].calendarPlaceholder}</p>
        </div>
      </div>

      <div className="booking-summary">
        <div className="price-section">
          <span className="price">{doctor.price} {translations[lang].baht}</span>
          <span className="time">{doctor.time} {translations[lang].minute}</span>
        </div>
        <button className="btn btn-primary btn-lg">{translations[lang].confirmBooking}</button>
      </div>
    </div>
  );
};

export default BookingPage;

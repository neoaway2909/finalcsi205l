import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './BookingSuccessPage.css';

const BookingSuccessPage = ({ doctor, appointment, onDone }) => {
  if (!doctor || !appointment) {
    return null; // Or show a generic success message
  }

  const { date, time } = appointment;

  // Ensure date is a valid Date object
  let formattedDate = 'N/A';
  if (date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  return (
    <div className="booking-success-page">
      <div className="success-icon-container">
        <FaCheck size={50} />
      </div>
      <h2>Booking Successful!</h2>
      <p className="confirmation-message">
        You have successfully booked an appointment with <strong>{doctor.name}</strong> on <strong>{formattedDate}</strong> at <strong>{time}</strong>.
      </p>
      <button onClick={onDone} className="btn btn-primary btn-done">Done</button>
    </div>
  );
};

export default BookingSuccessPage;

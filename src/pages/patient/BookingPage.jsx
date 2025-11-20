import React, { useState, useMemo } from 'react';
import { FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { translations } from '../../constants/translations';
import BookingSuccessPage from './BookingSuccessPage';
import './BookingPage.css';
import { bookAppointment, createNotification } from '../../firebase';
import useAuth from '../../hooks/useAuth';

const BookingPage = ({ doctor, onBack, lang, onBookingComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingState, setBookingState] = useState('form'); // 'form', 'booking', 'success'
  const { userProfile } = useAuth();

  if (!doctor) {
    return (
      <div className="page-placeholder">
        <h2>{translations[lang].noDoctorSelected}</h2>
        <p>{translations[lang].noDoctorSelectedDesc}</p>
        <button onClick={onBack} className="btn btn-secondary">{translations[lang].goBack}</button>
      </div>
    );
  }

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth && !day.disabled && !day.unavailable) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
      setSelectedDate(newSelectedDate);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!userProfile) {
      console.error("User not logged in");
      return;
    }
    setBookingState('booking');
    try {
      const appointmentData = {
        doctorId: doctor.id,
        patientId: userProfile.uid,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
        time: selectedTime,
        status: 'scheduled',
        createdAt: new Date(),
      };
      const appointmentId = await bookAppointment(appointmentData);
      await createNotification({
        type: 'new_booking',
        appointmentId,
        doctorId: doctor.id,
        patientId: userProfile.uid,
        message: `New booking from ${userProfile.displayName} for Dr. ${doctor.name} on ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
        timestamp: new Date(),
      });
      setBookingState('success');
    } catch (error) {
      console.error("Error booking appointment: ", error);
      setBookingState('form');
    }
  };

  const generateCalendar = (year, month) => {
    const monthData = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push({ date: daysInPrevMonth - firstDay + j + 1, isCurrentMonth: false });
        } else if (day > daysInMonth) {
          week.push({ date: day - daysInMonth, isCurrentMonth: false });
          day++;
        } else {
          const today = new Date();
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isUnavailable = (day === 10 || day === 15) && month === currentDate.getMonth() && year === currentDate.getFullYear(); // Example unavailable days
          week.push({ date: day, isCurrentMonth: true, disabled: isPast, unavailable: isUnavailable });
          day++;
        }
      }
      monthData.push(week);
      if (day > daysInMonth) break;
    }
    return monthData;
  };

  const calendarMonth = useMemo(() => generateCalendar(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    if (newDate.getFullYear() >= 2025 && newDate.getFullYear() <= 2027) {
      setCurrentDate(newDate);
    }
  };

  const calendarDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (bookingState === 'success') {
    return <BookingSuccessPage doctor={doctor} appointment={{ date: selectedDate, time: selectedTime }} onDone={() => onBookingComplete({ date: selectedDate, time: selectedTime })} />;
  }

  return (
    <div className="booking-page">
      <button onClick={onBack} className="btn btn-link">
        &larr; {translations[lang].back}
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
        <div className="calendar-header">
          <h3>{translations[lang].selectDate}</h3>
          <div className="calendar-nav">
            <button className="btn-icon" onClick={() => navigateMonth(-1)} disabled={currentDate.getFullYear() === 2025 && currentDate.getMonth() === 0}><FaChevronLeft /></button>
            <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button className="btn-icon" onClick={() => navigateMonth(1)} disabled={currentDate.getFullYear() === 2027 && currentDate.getMonth() === 11}><FaChevronRight /></button>
          </div>
        </div>
        <div className="calendar-grid">
          {calendarDays.map(day => <div key={day} className="calendar-day">{day}</div>)}
          {calendarMonth.flat().map((day, index) => (
            <div
              key={index}
              className={`calendar-date ${day.isCurrentMonth ? '' : 'not-current-month'} ${selectedDate && day.isCurrentMonth && selectedDate.getDate() === day.date && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear() ? 'selected' : ''} ${day.disabled ? 'disabled' : ''} ${day.unavailable ? 'unavailable' : ''}`}
              onClick={() => handleDateSelect(day)}
            >
              {day.date}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="booking-time-container">
          <h3>{translations[lang].selectTime}</h3>
          <div className="time-slots-grid">
            {timeSlots.map(time => (
              <div
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="booking-summary">
        <button 
          className="btn btn-primary btn-lg" 
          disabled={!selectedDate || !selectedTime || bookingState === 'booking'}
          onClick={handleBookAppointment}
        >
          {bookingState === 'booking' ? 'Booking...' : translations[lang].bookAppointment}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;

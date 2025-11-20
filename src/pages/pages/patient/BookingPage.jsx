import React, { useState, useEffect } from 'react';
import { translations } from '../../constants/translations';
import BookingSuccessPage from './BookingSuccessPage';
import { AlertModal } from '../../components/common';
import { DoctorProfileHeader } from '../../components/booking/DoctorProfileHeader';
import { CalendarPicker } from '../../components/booking/CalendarPicker';
import { TimeSlotPicker } from '../../components/booking/TimeSlotPicker';
import './BookingPage.css';
import { bookAppointment, createNotification } from '../../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import useAuth from '../../hooks/useAuth';

const BookingPage = ({ doctor, onBack, lang, onBookingComplete, bookingTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingState, setBookingState] = useState('form'); // 'form', 'booking', 'success'
  const [alertModal, setAlertModal] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const { userProfile } = useAuth();

  // Determine if this is an instant appointment based on the tab user clicked from
  const isInstantAppointment = bookingTab === "instant" || doctor.appointmentType === "instant";

  // Fetch booked time slots when date changes
  useEffect(() => {
    if (!selectedDate || !doctor || isInstantAppointment) return;

    const fetchBookedSlots = async () => {
      const appointmentDate = selectedDate.toISOString().split('T')[0];
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctor.id),
        where("date", "==", appointmentDate),
        where("status", "in", ["scheduled", "instant"])
      );

      const snapshot = await getDocs(appointmentsQuery);
      const booked = {};
      snapshot.docs.forEach(doc => {
        const appointment = doc.data();
        booked[appointment.time] = true;
      });
      setBookedSlots(booked);
    };

    fetchBookedSlots();
  }, [selectedDate, doctor, isInstantAppointment]);

  const handleDateSelect = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleMonthNavigate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    if (newDate.getFullYear() >= 2025 && newDate.getFullYear() <= 2027) {
      setCurrentDate(newDate);
    }
  };

  const handleBookAppointment = async () => {
    if (!userProfile) {
      console.error("User not logged in");
      setAlertModal({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to book an appointment.'
      });
      return;
    }

    setBookingState('booking');

    try {
      // For instant appointments, use current date and time
      const appointmentDate = isInstantAppointment
        ? new Date().toISOString().split('T')[0]
        : selectedDate.toISOString().split('T')[0];

      // Check if doctor is already booked at this time
      const existingAppointmentsQuery = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctor.id),
        where("date", "==", appointmentDate),
        where("time", "==", selectedTime),
        where("status", "in", ["scheduled", "instant"])
      );
      const existingAppointments = await getDocs(existingAppointmentsQuery);

      if (!existingAppointments.empty) {
        setAlertModal({
          type: 'error',
          title: 'เวลานี้ไม่ว่าง',
          message: 'หมอท่านนี้มีนัดหมายในเวลานี้แล้ว กรุณาเลือกเวลาอื่น'
        });
        setBookingState('form');
        return;
      }

      const appointmentData = {
        doctorId: doctor.id,
        patientId: userProfile.uid,
        date: appointmentDate,
        time: selectedTime,
        status: isInstantAppointment ? 'instant' : 'scheduled',
        appointmentType: isInstantAppointment ? 'instant' : 'advance',
        createdAt: new Date(),
      };
      const appointmentId = await bookAppointment(appointmentData);

      // Create notification
      const displayDate = isInstantAppointment
        ? new Date().toLocaleDateString()
        : selectedDate.toLocaleDateString();

      await createNotification({
        type: 'new_booking',
        appointmentId,
        doctorId: doctor.id,
        patientId: userProfile.uid,
        message: `New booking from ${userProfile.displayName} for Dr. ${doctor.name} on ${displayDate} at ${selectedTime}.`,
        timestamp: new Date(),
      });

      // Check if there's already a chat room between patient and doctor
      const existingMessagesQuery = query(
        collection(db, "messages"),
        where("patientId", "==", userProfile.uid),
        where("doctorId", "==", doctor.id)
      );
      const existingMessages = await getDocs(existingMessagesQuery);

      // Only send welcome message if this is the first appointment with this doctor
      if (existingMessages.empty) {
        const welcomeMessage = `สวัสดีครับคุณ ${userProfile.displayName || 'คนไข้'} 👋

ขอบคุณที่จองนัดหมายกับผมนะครับ ผมยินดีที่จะให้บริการคุณในวันที่ ${displayDate} เวลา ${selectedTime}

หากมีคำถามหรือข้อกังวลใดๆ ก่อนวันนัดหมาย สามารถส่งข้อความมาได้เลยครับ

ด้วยความเคารพ
นพ. ${doctor.name}`;

        await addDoc(collection(db, "messages"), {
          patientId: userProfile.uid,
          doctorId: doctor.id,
          senderId: doctor.id,
          senderName: `นพ. ${doctor.name}`,
          text: welcomeMessage,
          timestamp: new Date(),
          read: false,
          isAutomatic: true
        });
      } else {
        // Send a new appointment notification to existing chat
        const appointmentMessage = `📅 จองนัดหมายใหม่สำเร็จ\nวันที่: ${displayDate}\nเวลา: ${selectedTime}`;
        await addDoc(collection(db, "messages"), {
          patientId: userProfile.uid,
          doctorId: doctor.id,
          senderId: doctor.id,
          senderName: `นพ. ${doctor.name}`,
          text: appointmentMessage,
          timestamp: new Date(),
          read: false,
          isAutomatic: true
        });
      }

      // Store the booked appointment data
      const actualDate = isInstantAppointment ? new Date() : selectedDate;
      setBookedAppointment({
        date: actualDate,
        time: selectedTime
      });

      setBookingState('success');
    } catch (error) {
      console.error("Error booking appointment: ", error);
      setAlertModal({
        type: 'error',
        title: 'Booking Failed',
        message: 'Failed to book appointment. Please check your permissions or try again later.'
      });
      setBookingState('form');
    }
  };

  // Time slots configuration
  const advanceTimeSlots = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"];
  const instantTimeSlots = [
    { label: translations[lang].now || "Now", value: "now" },
    { label: translations[lang].in30min || "In 30 minutes", value: "30min" },
    { label: translations[lang].in1hour || "In 1 hour", value: "1hour" },
    { label: translations[lang].in2hours || "In 2 hours", value: "2hours" }
  ];
  const timeSlots = isInstantAppointment ? instantTimeSlots : advanceTimeSlots;

  // Early returns for special states
  if (!doctor) {
    return (
      <div className="page-placeholder">
        <h2>{translations[lang].noDoctorSelected}</h2>
        <p>{translations[lang].noDoctorSelectedDesc}</p>
        <button onClick={onBack} className="btn btn-secondary">{translations[lang].goBack}</button>
      </div>
    );
  }

  if (bookingState === 'success') {
    return <BookingSuccessPage doctor={doctor} appointment={bookedAppointment} onDone={onBookingComplete} />;
  }

  // Main booking form
  return (
    <div className="booking-page">
      <button onClick={onBack} className="btn btn-link">
        &larr; {translations[lang].back}
      </button>

      <DoctorProfileHeader doctor={doctor} />

      {!isInstantAppointment && (
        <CalendarPicker
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthNavigate={handleMonthNavigate}
          lang={lang}
        />
      )}

      {(isInstantAppointment || selectedDate) && (
        <TimeSlotPicker
          timeSlots={timeSlots}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          bookedSlots={bookedSlots}
          isInstantAppointment={isInstantAppointment}
          lang={lang}
        />
      )}

      <div className="booking-summary">
        <button
          className="btn btn-primary btn-lg"
          disabled={(isInstantAppointment ? !selectedTime : (!selectedDate || !selectedTime)) || bookingState === 'booking'}
          onClick={handleBookAppointment}
        >
          {bookingState === 'booking' ? 'Booking...' : translations[lang].bookAppointment}
        </button>
      </div>

      {alertModal && (
        <AlertModal
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onClose={() => setAlertModal(null)}
        />
      )}
    </div>
  );
};

export default BookingPage;

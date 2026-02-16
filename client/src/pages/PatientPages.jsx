import React, { useState, useEffect } from 'react';
import { FaUser, FaCheck, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import { translations } from '../constants/translations';
import { AppointmentCard, MedicalHistoryCard, EmptyState, LoadingSkeletonCard, ActionButton, AlertModal, DoctorCard } from '../components/CommonComponents';
import { DoctorProfileHeader, CalendarPicker, TimeSlotPicker } from '../components/BookingComponents';
import { AIChatModal } from '../components/ChatComponents';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { bookAppointment, createNotification } from '../firebase';
import mainBannerImage from '../assets/821547.jpg'; // Add this line

// ==================== AboutDoctorPage ====================
export const AboutDoctorPage = ({ doctor, onBack, onBookAppointment }) => {
  if (!doctor) {
    return null;
  }

  return (
    <div className="p-5 animate-[fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="text-[#668ee0] no-underline font-semibold mb-5 inline-flex items-center gap-1.5 text-[0.95rem] hover:underline"
      >
        &larr; Back to Doctor List
      </button>

      <div className="flex items-center mb-7 bg-white p-5 rounded-[15px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#e0e8f3]">
        <div className="mr-5 rounded-full overflow-hidden w-20 h-20 flex items-center justify-center bg-[#e0e8f3] text-[#666] flex-shrink-0">
          <FaUser size={48} color="#c0d1f0" />
        </div>
        <div>
          <h2 className="text-[1.4rem] font-bold m-0 mb-1 text-[#333]">{doctor.name}</h2>
          <p className="text-[0.95rem] text-[#668ee0] bg-[#d8e2f8] py-[3px] px-2.5 rounded-lg inline-block mb-1 font-medium">
            {doctor.specialty}
          </p>
          <p className="text-[0.9rem] text-[#666] m-0">{doctor.hospital}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[15px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-6 border border-[#e0e8f3]">
        <h3 className="text-[1.1rem] font-bold mt-0 mb-4 text-[#333] border-b-2 border-[#f0f0f0] pb-2.5 inline-block">
          About
        </h3>
        <p className="text-[#555] leading-6 text-[0.95rem] m-0">
          Dr. {doctor.name} is a highly respected {doctor.specialty} with over 15 years of experience.
          Known for a compassionate approach and dedication to patient well-being, Dr. {doctor.name} is a leading expert in the field.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[15px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-6 border border-[#e0e8f3]">
        <h3 className="text-[1.1rem] font-bold mt-0 mb-4 text-[#333] border-b-2 border-[#f0f0f0] pb-2.5 inline-block">
          Working Experience
        </h3>
        <div className="mb-4 pl-4 border-l-[3px] border-[#668ee0]">
          <strong className="block font-semibold text-[#333] mb-0.5">Senior Consultant</strong>
          <span>{doctor.hospital} (2015 - Present)</span>
        </div>
        <div className="pl-4 border-l-[3px] border-[#668ee0]">
          <strong className="block font-semibold text-[#333] mb-0.5">Resident Physician</strong>
          <span>General Hospital (2010 - 2015)</span>
        </div>
      </div>

      <div className="text-center mt-7 mb-5">
        <button
          onClick={onBookAppointment}
          className="bg-[#668ee0] text-white border-none py-3 px-7 rounded-[10px] text-base font-semibold cursor-pointer shadow-[0_4px_10px_rgba(102,142,224,0.3)] transition-all duration-200 hover:bg-[#5076c2] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(102,142,224,0.4)]"
        >
          Book an Appointment
        </button>
      </div>
    </div>
  );
};

// ==================== AppointmentsPage ====================
export const AppointmentsPage = ({ lang, appointments }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [medicalHistories, setMedicalHistories] = useState([]);
  const { user } = useAuth();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = typeof apt.date === 'string' ? new Date(apt.date) : apt.date;
    return aptDate >= now;
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = typeof apt.date === 'string' ? new Date(apt.date) : apt.date;
    return aptDate < now;
  });

  const appointmentsToShow = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  useEffect(() => {
    if (!db || !user) return;

    const medicalHistoryCol = collection(db, "medical_history");
    const q = query(medicalHistoryCol, where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const histories = await Promise.all(
          snapshot.docs.map(async (historyDoc) => {
            const historyData = historyDoc.data();
            const doctorDocRef = doc(db, "users", historyData.doctorId);
            const doctorDoc = await getDoc(doctorDocRef);
            const doctorData = doctorDoc.exists() ? doctorDoc.data() : {};

            return {
              id: historyDoc.id,
              ...historyData,
              doctor: {
                id: historyData.doctorId,
                name: doctorData.displayName || "Unknown Doctor",
                specialty: doctorData.specialty || "General Medicine",
              }
            };
          })
        );
        histories.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
        setMedicalHistories(histories);
      },
      (error) => {
        console.error("Error fetching medical histories:", error);
        setMedicalHistories([]);
      }
    );
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-5 animate-[fade-in_0.5s_ease-out]">
      <div className="mb-6">
        <h2 className="text-[1.8rem] font-bold text-[#333] m-0 mb-1">
          {translations[lang].pageAppointments}
        </h2>
        <p className="text-[#666] m-0">จัดการนัดหมายและประวัติการรักษาของคุณ</p>
      </div>

      <div className="flex gap-7 mb-6 border-b border-[#f0f0f0]">
        <button
          className={`bg-none border-none py-3 px-1 text-base cursor-pointer font-semibold relative transition-colors duration-200 ${
            activeTab === "upcoming"
              ? "text-[#668ee0] after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[3px] after:bg-[#668ee0] after:rounded-t-[3px] after:animate-[slide-up_0.3s_ease-out]"
              : "text-[#999] hover:text-[#666]"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Appointments
        </button>
        <button
          className={`bg-none border-none py-3 px-1 text-base cursor-pointer font-semibold relative transition-colors duration-200 ${
            activeTab === "past"
              ? "text-[#668ee0] after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[3px] after:bg-[#668ee0] after:rounded-t-[3px] after:animate-[slide-up_0.3s_ease-out]"
              : "text-[#999] hover:text-[#666]"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Medical History
        </button>
      </div>

      {activeTab === "upcoming" ? (
        appointmentsToShow && appointmentsToShow.length > 0 ? (
          <div className="flex flex-col gap-5">
            {appointmentsToShow.map((app) => (
              <AppointmentCard key={app.id} appointment={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-5 text-[#999] bg-[#f9f9f9] rounded-[15px] border-2 border-dashed border-[#e0e0e0]">
            <FaCalendarAlt size={48} />
            <p className="mt-2.5 text-base">No upcoming appointments.</p>
          </div>
        )
      ) : (
        medicalHistories && medicalHistories.length > 0 ? (
          <div className="flex flex-col gap-5">
            {medicalHistories.map((history) => (
              <MedicalHistoryCard key={history.id} history={history} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-5 text-[#999] bg-[#f9f9f9] rounded-[15px] border-2 border-dashed border-[#e0e0e0]">
            <FaCalendarAlt size={48} />
            <p className="mt-2.5 text-base">No medical history records.</p>
          </div>
        )
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ==================== BookingPage ====================
export const BookingPage = ({ doctor, onBack, lang, onBookingComplete, bookingTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingState, setBookingState] = useState('form');
  const [alertModal, setAlertModal] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const { userProfile } = useAuth();

  const isInstantAppointment = bookingTab === "instant" || doctor.appointmentType === "instant";

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
    setSelectedTime(null);
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
      const appointmentDate = isInstantAppointment
        ? new Date().toISOString().split('T')[0]
        : selectedDate.toISOString().split('T')[0];

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

      const existingMessagesQuery = query(
        collection(db, "messages"),
        where("patientId", "==", userProfile.uid),
        where("doctorId", "==", doctor.id)
      );
      const existingMessages = await getDocs(existingMessagesQuery);

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

  const advanceTimeSlots = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"];
  const instantTimeSlots = [
    { label: translations[lang].now || "Now", value: "now" },
    { label: translations[lang].in30min || "In 30 minutes", value: "30min" },
    { label: translations[lang].in1hour || "In 1 hour", value: "1hour" },
    { label: translations[lang].in2hours || "In 2 hours", value: "2hours" }
  ];
  const timeSlots = isInstantAppointment ? instantTimeSlots : advanceTimeSlots;

  if (!doctor) {
    return (
      <div className="p-10 text-center">
        <h2>{translations[lang].noDoctorSelected}</h2>
        <p>{translations[lang].noDoctorSelectedDesc}</p>
        <button onClick={onBack} className="bg-[#6c757d] text-white border-none py-2 px-4 rounded-lg cursor-pointer">
          {translations[lang].goBack}
        </button>
      </div>
    );
  }

  if (bookingState === 'success') {
    return <BookingSuccessPage doctor={doctor} appointment={bookedAppointment} onDone={onBookingComplete} />;
  }

  return (
    <div className="p-5 animate-[anim-fade-in_0.3s_ease-out]">
      <button
        onClick={onBack}
        className="text-[#6B9BF6] no-underline font-bold mb-5 inline-block"
      >
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

      <div className="flex justify-end items-center mt-5">
        <button
          className="py-4 px-7 text-[1.1rem] bg-[#668ee0] text-white border-none rounded-lg cursor-pointer font-semibold transition-all hover:bg-[#5076c2] disabled:bg-[#ccc] disabled:cursor-not-allowed"
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

      <style jsx>{`
        @keyframes anim-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ==================== BookingSuccessPage ====================
export const BookingSuccessPage = ({ doctor, appointment, onDone }) => {
  if (!doctor || !appointment) {
    return null;
  }

  const { date, time } = appointment;

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
    <div className="flex flex-col items-center justify-center text-center p-10 animate-[anim-fade-in_0.5s_ease-out]">
      <div className="w-[100px] h-[100px] rounded-full bg-[#4CAF50] flex items-center justify-center mb-7 text-white animate-[icon-pop-in_0.5s_cubic-bezier(0.68,-0.55,0.27,1.55)]">
        <FaCheck size={50} />
      </div>
      <h2 className="text-[2rem] font-bold text-[#333] mb-4">Booking Successful!</h2>
      <p className="text-[1.1rem] text-[#666] mb-10 max-w-[400px]">
        You have successfully booked an appointment with <strong>{doctor.name}</strong> on <strong>{formattedDate}</strong> at <strong>{time}</strong>.
      </p>
      <button
        onClick={onDone}
        className="py-4 px-[60px] text-[1.1rem] bg-[#668ee0] text-white border-none rounded-lg cursor-pointer font-semibold transition-all hover:bg-[#5076c2]"
      >
        Done
      </button>

      <style jsx>{`
        @keyframes icon-pop-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes anim-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ==================== HomePage ====================
export const HomePage = ({ userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang, onBook }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const filteredDoctors = doctors.filter(doc => {
    if (activeTab === "instant") {
      return doc.appointmentType === "instant" || doc.appointmentType === "both";
    } else if (activeTab === "book") {
      return doc.appointmentType === "advance" || doc.appointmentType === "both";
    }
    return true;
  });

  const handleAskAI = () => {
    setIsAIChatOpen(true);
  };

  return (
    <>
      <div className="main-banner-content">
        <div className="banner-text-content">
          <h2 className="banner-text">{translations[lang].welcomeBack}, {userName}!</h2>
          <p className="banner-subtext">{translations[lang].howFeeling}</p>
        </div>
        <img src={mainBannerImage} alt="Main Banner" className="main-banner-image" />
      </div>
      <div className="action-icons-row-large">
        <ActionButton
          isImage={true}
          imageSrc={BotIcon}
          label={translations[lang].askAI}
          onClick={handleAskAI}
        />
      </div>
      <div className="tab-selector" style={{marginTop: '25px'}}>
        <span
          className={activeTab === "instant" ? "active-tab" : "inactive-tab"}
          onClick={() => setActiveTab("instant")}
        >
          {translations[lang].instantDoctor}
        </span>
        <span
          className={activeTab === "book" ? "active-tab" : "inactive-tab"}
          onClick={() => setActiveTab("book")}
        >
          {translations[lang].bookAppointment}
        </span>
      </div>
      <div className="doctor-list">
        {isLoading ? (
          <><LoadingSkeletonCard /><LoadingSkeletonCard /></>
        ) : filteredDoctors.length === 0 ? (
          <EmptyState message={translations[lang].noDoctorsFound} icon={<FaUserMd size={48} />} />
        ) : (
          filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              name={doc.name || "N/A"}
              specialty={doc.specialty || "N/A"}
              hospital={doc.hospital || "N/A"}
              cases={doc.cases || 0}
              price={doc.price || 0}
              time={doc.time || 0}
              lang={lang}
              onBook={() => onBook(doc)}
            />
          ))
        )}
      </div>

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        lang={lang}
      />
    </>
  );
};

import React, { useState, useEffect } from "react";
import { translations } from "../../constants/translations";
import AppointmentCard from "../../components/common/AppointmentCard";
import MedicalHistoryCard from "../../components/common/MedicalHistoryCard";
import { EmptyState } from "../../components/common";
import { FaCalendarAlt } from "react-icons/fa";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";
import "./AppointmentsPage.css";

export const AppointmentsPage = ({ lang, appointments }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [medicalHistories, setMedicalHistories] = useState([]);
  const { user } = useAuth();

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = typeof apt.date === 'string' ? new Date(apt.date) : apt.date;
    return aptDate >= now;
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = typeof apt.date === 'string' ? new Date(apt.date) : apt.date;
    return aptDate < now;
  });

  const appointmentsToShow =
    activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  // Fetch medical histories
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
            // Fetch doctor details
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
        // Sort by date, most recent first
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
    <div className="appointments-page-container">
      <div className="page-header">
        <h2>{translations[lang].pageAppointments}</h2>
        <p>จัดการนัดหมายและประวัติการรักษาของคุณ</p>
      </div>

      <div className="appt-tab-selector">
        <button
          className={`appt-tab ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Appointments
        </button>
        <button
          className={`appt-tab ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Medical History
        </button>
      </div>

      {activeTab === "upcoming" ? (
        appointmentsToShow && appointmentsToShow.length > 0 ? (
          <div className="appointments-list">
            {appointmentsToShow.map((app) => (
              <AppointmentCard key={app.id} appointment={app} />
            ))}
          </div>
        ) : (
          <div className="empty-appt">
            <FaCalendarAlt size={48} />
            <p>No upcoming appointments.</p>
          </div>
        )
      ) : (
        medicalHistories && medicalHistories.length > 0 ? (
          <div className="appointments-list">
            {medicalHistories.map((history) => (
              <MedicalHistoryCard key={history.id} history={history} />
            ))}
          </div>
        ) : (
          <div className="empty-appt">
            <FaCalendarAlt size={48} />
            <p>No medical history records.</p>
          </div>
        )
      )}
    </div>
  );
};

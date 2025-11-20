import React, { useState } from "react";
import { translations } from "../../constants/translations";
import AppointmentCard from "../../components/common/AppointmentCard";
import { EmptyState } from "../../components/common";
import { FaCalendarAlt } from "react-icons/fa";
import "./AppointmentsPage.css";

export const AppointmentsPage = ({ lang, appointments }) => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= now
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < now
  );

  const appointmentsToShow =
    activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  return (
    <div className="appointments-page">
      <h2>{translations[lang].pageAppointments}</h2>

      <div className="tab-selector">
        <span
          className={activeTab === "upcoming" ? "active-tab" : "inactive-tab"}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </span>
        <span
          className={activeTab === "past" ? "active-tab" : "inactive-tab"}
          onClick={() => setActiveTab("past")}
        >
          medical history
        </span>
      </div>

      {appointmentsToShow && appointmentsToShow.length > 0 ? (
        <div className="appointment-list">
          {appointmentsToShow.map((app) => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      ) : (
        <EmptyState
          message={
            activeTab === "upcoming"
              ? "No upcoming appointments."
              : "No past appointments."
          }
          icon={<FaCalendarAlt size={48} />}
        />
      )}
    </div>
  );
};

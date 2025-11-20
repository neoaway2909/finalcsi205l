import React, { useState, useEffect } from 'react';
import { translations } from "../../constants/translations";
import PatientCard from "../../components/common/PatientCard";
import { EmptyState } from "../../components/common";
import { FaUsers } from "react-icons/fa";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import useAuth from '../../hooks/useAuth';
import { addMedicalHistory, updateAppointmentStatus } from '../../firebase';
import MedicalHistoryModal from '../../components/common/MedicalHistoryModal';
console.log({ addMedicalHistory, updateAppointmentStatus });

export const QueuePage = ({ lang, db }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!db || !user) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const appointmentsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const appointment = { id: doc.id, ...doc.data() };
        const patientDoc = await getDoc(doc(db, "users", appointment.patientId));
        const patientData = patientDoc.data();
        return { ...appointment, patient: patientData };
      }));
      setAppointments(appointmentsData);
      setIsLoading(false);
    };

    fetchAppointments();
  }, [db, user]);

  const handleAddMedicalHistory = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

const handleModalSave = async (historyData) => {
    try {
      await addMedicalHistory(historyData);
      // Optionally, update the appointment status to 'completed_with_history'
    } catch (error) {
      console.error("Error saving medical history: ", error);
    }
    handleModalClose();
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, 'completed');
      setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: 'completed' } : app));
    } catch (error) {
      console.error("Error completing appointment: ", error);
    }
  };

  return (
    <div className="queue-page">
      <h2>{translations[lang].queue}</h2>
      
      {isLoading ? (
        <p>Loading patients...</p>
      ) : appointments.length > 0 ? (
        <div className="patient-list">
          {appointments.map(app => (
            <PatientCard 
              key={app.id} 
              appointment={app} 
              onAddMedicalHistory={handleAddMedicalHistory}
              onComplete={handleCompleteAppointment}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          message="No patients in the queue."
          icon={<FaUsers size={48} />}
        />
      )}

      {isModalOpen && (
        <MedicalHistoryModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

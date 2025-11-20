import React, { useState, useEffect } from 'react';
import { translations } from "../../constants/translations";
import PatientCard from "../../components/common/PatientCard";
import { EmptyState } from "../../components/common";
import { FaUsers, FaClipboardList } from "react-icons/fa";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import useAuth from '../../hooks/useAuth';
import { addMedicalHistory, updateAppointmentStatus } from '../../firebase';
import MedicalHistoryModal from '../../components/common/MedicalHistoryModal';
import ViewMedicalHistoryModal from '../../components/common/ViewMedicalHistoryModal';
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";

export const QueuePage = ({ lang, db }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!db || !user) {
      console.log("QueuePage: DB or user not available");
      setIsLoading(false);
      return;
    }

    console.log(`QueuePage: Fetching appointments for doctor: ${user.uid}`);
    setIsLoading(true);
    const appointmentsCol = collection(db, "appointments");
    const q = query(appointmentsCol, where("doctorId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(`QueuePage: Found ${snapshot.docs.length} appointments`);
        const appointmentsData = await Promise.all(
          snapshot.docs.map(async (appointmentDoc) => {
            const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() };
            const patientDoc = await getDoc(doc(db, "users", appointment.patientId));
            const patientData = patientDoc.exists() ? patientDoc.data() : {};
            return { ...appointment, patient: patientData };
          })
        );
        console.log("QueuePage: Appointments data:", appointmentsData);
        setAppointments(appointmentsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("QueuePage: Error fetching appointments:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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

  const handleViewHistory = (appointment) => {
    setViewingHistoryFor(appointment);
  };

  const handleCloseViewHistory = () => {
    setViewingHistoryFor(null);
  };

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return app.status === 'scheduled' || app.status === 'instant';
    if (activeTab === 'completed') return app.status === 'completed';
    return true;
  });

  const waitingCount = appointments.filter(app => app.status === 'scheduled' || app.status === 'instant').length;
  const completedCount = appointments.filter(app => app.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FaClipboardList className="text-primary" />
            {translations[lang].queue}
          </h1>
          <p className="text-muted-foreground mt-1">
            {translations[lang]?.queueDescription || 'Manage your patient appointments'}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {appointments.length} {translations[lang]?.totalPatients || 'Total'}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">{appointments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="waiting" className="gap-2">
            Waiting
            <Badge variant="secondary" className="ml-1">{waitingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            <Badge variant="secondary" className="ml-1">{completedCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="grid gap-4">
              {filteredAppointments.map(app => (
                <PatientCard
                  key={app.id}
                  appointment={app}
                  onAddMedicalHistory={handleAddMedicalHistory}
                  onComplete={handleCompleteAppointment}
                  onViewHistory={handleViewHistory}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={activeTab === 'waiting' ? 'No patients waiting' : activeTab === 'completed' ? 'No completed appointments' : 'No patients in the queue'}
              icon={<FaUsers size={48} />}
            />
          )}
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <MedicalHistoryModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
          onSave={handleModalSave}
          lang={lang}
        />
      )}

      {viewingHistoryFor && (
        <ViewMedicalHistoryModal
          patientId={viewingHistoryFor.patientId}
          patientName={viewingHistoryFor.patient?.displayName || viewingHistoryFor.patient?.email || 'Unknown Patient'}
          onClose={handleCloseViewHistory}
          lang={lang}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { translations } from "../../constants/translations";
import PatientCard from "../../components/common/PatientCard";
import { EmptyState } from "../../components/common";
import { FaUsers } from "react-icons/fa";

export const QueuePage = ({ lang, db }) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, using a static list of patients for demonstration.
  // In a real application, you would fetch this from Firestore using the 'db' prop.
  useEffect(() => {
    const staticPatients = [
      { id: 1, name: 'John Doe', age: 35, gender: 'Male', reason: 'Follow-up checkup' },
      { id: 2, name: 'Jane Smith', age: 28, gender: 'Female', reason: 'Sore throat' },
    ];
    setPatients(staticPatients);
    setIsLoading(false);
  }, []);

  const handleAccept = (patient) => {
    alert(`Accepted patient: ${patient.name}`);
    // Here you would typically update the patient's status in the database
  };

  const handleDecline = (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  };

  return (
    <div className="queue-page">
      <h2>{translations[lang].queue}</h2>
      
      {isLoading ? (
        <p>Loading patients...</p>
      ) : patients.length > 0 ? (
        <div className="patient-list">
          {patients.map(p => (
            <PatientCard 
              key={p.id} 
              patient={p} 
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          message="No patients in the queue."
          icon={<FaUsers size={48} />}
        />
      )}
    </div>
  );
};

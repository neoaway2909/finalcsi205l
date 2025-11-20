import React, { useState } from 'react';
import './MedicalHistoryModal.css';

const MedicalHistoryModal = ({ appointment, onClose, onSave }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis,
      prescription,
      notes,
      createdAt: new Date(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Medical History</h2>
        <div className="form-group">
          <label>Diagnosis</label>
          <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Prescription</label>
          <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryModal;

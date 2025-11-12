import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoadingSkeletonRow, EmptyState } from "../../components/common";
import { translations } from "../../constants/translations";

export const PatientManagementPage = ({ lang, setProfileToView, db, isDirty, handleSaveProfile }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const patientsCol = collection(db, "users");
    const q = query(patientsCol, where("role", "==", "patient"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching patients: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  const handleRowClick = (patient) => {
    if (isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile();
      }
    }
    setProfileToView(patient);
    navigate('/profile');
  };

  return (
    <div className="management-page-content">
      <div className="admin-stats-header">
        <div className="stat-card-container">
          <div className="stat-card">
            <FaUsers size={32} color="var(--primary-color)" />
            <h3>{patients.length}</h3>
            <p>{translations[lang].totalPatients}</p>
          </div>
        </div>
      </div>
      <h2>{translations[lang].patientManagement}</h2>
      <p>{translations[lang].pagePatientMgmtDesc}</p>
      <table className="management-table">
        <thead>
          <tr>
            <th>{translations[lang].firstNameLastName}</th>
            <th>{translations[lang].email}</th>
            <th>{translations[lang].status}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={3} />
          ) : patients.length === 0 ? (
            <tr><td colSpan="3"><EmptyState message={translations[lang].noPatientsFound} icon={<FaUsers size={48} />} /></td></tr>
          ) : (
            patients.map((patient) => (
              <tr
                key={patient.id}
                className="clickable-row"
                onClick={() => handleRowClick(patient)}
              >
                <td>{patient.displayName || "N/A"}</td>
                <td>{patient.email || "N/A"}</td>
                <td><span className="status-active">{translations[lang].active}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

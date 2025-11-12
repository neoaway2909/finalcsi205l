import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserMd } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoadingSkeletonRow, EmptyState } from "../../components/common";
import { translations } from "../../constants/translations";

export const DoctorManagementPage = ({ lang, setProfileToView, db, isDirty, handleSaveProfile }) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const doctorsCol = collection(db, "users");
    const q = query(doctorsCol, where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doctorsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDoctors(doctorsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  const handleRowClick = (doc) => {
    if (isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile();
      }
    }
    setProfileToView(doc);
    navigate('/profile');
  };

  return (
    <div className="management-page-content">
      <div className="admin-stats-header">
        <div className="stat-card-container">
          <div className="stat-card">
            <FaUserMd size={32} color="var(--primary-color)" />
            <h3>{doctors.length}</h3>
            <p>{translations[lang].totalDoctors}</p>
          </div>
        </div>
      </div>

      <h2>{translations[lang].doctorManagement}</h2>
      <p>{translations[lang].pageDoctorMgmtDesc}</p>
      <table className="management-table">
        <thead>
          <tr>
            <th>{translations[lang].firstNameLastName}</th>
            <th>{translations[lang].email}</th>
            <th>{translations[lang].status}</th>
            <th>{translations[lang].action}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={4} />
          ) : doctors.length === 0 ? (
            <tr><td colSpan="4"><EmptyState message={translations[lang].noDoctorsFound} icon={<FaUserMd size={48} />} /></td></tr>
          ) : (
            doctors.map((doc) => (
              <tr
                key={doc.id}
                className="clickable-row"
                onClick={() => handleRowClick(doc)}
              >
                <td>{doc.name || "N/A"}</td>
                <td>{doc.email || "N/A"}</td>
                <td>
                  {doc.status === 'active' ? (
                    <span className="status-active">{translations[lang].active}</span>
                  ) : (
                    <span className="status-pending">{translations[lang].pending}</span>
                  )}
                </td>
                <td>
                  {doc.status !== 'active' ? (
                    <button className="btn btn-primary btn-approve" onClick={(e) => { e.stopPropagation(); }}>
                      {translations[lang].approve}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={(e) => e.stopPropagation()}>Edit</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

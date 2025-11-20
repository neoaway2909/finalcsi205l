import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoadingSkeletonRow, EmptyState, AlertModal } from "../../components/common";
import { translations } from "../../constants/translations";
import UserEditModal from "../../components/admin/UserEditModal";
import { updateUserProfile, deleteUser } from "../../firebase";
import "./ManagementPage.css";

export const PatientManagementPage = ({ lang, setProfileToView, db, isDirty, handleSaveProfile }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertModal, setAlertModal] = useState(null);

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
        setFilteredPatients(patientsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching patients: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  // Filter and search
  useEffect(() => {
    let result = patients;

    // Search by name or email
    if (searchTerm) {
      result = result.filter(p =>
        (p.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPatients(result);
  }, [patients, searchTerm]);

  const handleRowClick = (patient) => {
    if (isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile();
      }
    }
    setProfileToView(patient);
    navigate('/profile');
  };

  const handleEdit = (e, patient) => {
    e.stopPropagation();
    setEditingUser(patient);
  };

  const handleDelete = async (e, patient) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${patient.displayName || patient.email}? This action cannot be undone.`)) {
      try {
        await deleteUser(patient.id);
        setAlertModal({
          type: 'success',
          title: 'Success',
          message: 'Patient deleted successfully!'
        });
      } catch {
        setAlertModal({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete patient. Please try again.'
        });
      }
    }
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      const { id, ...updates } = updatedUser;
      await updateUserProfile(id, updates);
      setEditingUser(null);
      setAlertModal({
        type: 'success',
        title: 'Success',
        message: 'User updated successfully!'
      });
    } catch {
      setAlertModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user. Please try again.'
      });
    }
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

      {/* Search */}
      <div className="table-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="management-table">
        <thead>
          <tr>
            <th>{translations[lang].firstNameLastName}</th>
            <th>{translations[lang].email}</th>
            <th>{translations[lang].action}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={3} />
          ) : filteredPatients.length === 0 ? (
            <tr><td colSpan="3"><EmptyState message="No patients found" icon={<FaUsers size={48} />} /></td></tr>
          ) : (
            filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                className="clickable-row"
                onClick={() => handleRowClick(patient)}
              >
                <td>{patient.displayName || "N/A"}</td>
                <td>{patient.email || "N/A"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-primary"
                      onClick={(e) => handleEdit(e, patient)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={(e) => handleDelete(e, patient)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

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

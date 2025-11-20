import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaEdit, FaTrash, FaCheck, FaSearch } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { LoadingSkeletonRow, EmptyState, AlertModal } from "../../components/common";
import { translations } from "../../constants/translations";
import UserEditModal from "../../components/admin/UserEditModal";
import { updateUserProfile, deleteUser } from "../../firebase";
import "./ManagementPage.css";

export const DoctorManagementPage = ({ lang, setProfileToView, db, isDirty, handleSaveProfile }) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alertModal, setAlertModal] = useState(null);

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
        setFilteredDoctors(doctorsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  // Filter and search
  useEffect(() => {
    let result = doctors;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(doc => doc.status === statusFilter);
    }

    // Search by name or email
    if (searchTerm) {
      result = result.filter(doc =>
        (doc.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredDoctors(result);
  }, [doctors, searchTerm, statusFilter]);

  const handleRowClick = (doc) => {
    if (isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile();
      }
    }
    setProfileToView(doc);
    navigate('/profile');
  };

  const handleApprove = async (e, doctor) => {
    e.stopPropagation();
    if (window.confirm(`Approve ${doctor.displayName || doctor.email}?`)) {
      try {
        await updateUserProfile(doctor.id, { status: 'active' });
        setAlertModal({
          type: 'success',
          title: 'Success',
          message: 'Doctor approved successfully!'
        });
      } catch {
        setAlertModal({
          type: 'error',
          title: 'Error',
          message: 'Failed to approve doctor. Please try again.'
        });
      }
    }
  };

  const handleEdit = (e, doctor) => {
    e.stopPropagation();
    setEditingUser(doctor);
  };

  const handleDelete = async (e, doctor) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${doctor.displayName || doctor.email}? This action cannot be undone.`)) {
      try {
        await deleteUser(doctor.id);
        setAlertModal({
          type: 'success',
          title: 'Success',
          message: 'Doctor deleted successfully!'
        });
      } catch {
        setAlertModal({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete doctor. Please try again.'
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
            <FaUserMd size={32} color="var(--primary-color)" />
            <h3>{doctors.length}</h3>
            <p>{translations[lang].totalDoctors}</p>
          </div>
          <div className="stat-card">
            <FaCheck size={32} color="#4caf50" />
            <h3>{doctors.filter(d => d.status === 'active').length}</h3>
            <p>Active</p>
          </div>
          <div className="stat-card">
            <FaUserMd size={32} color="#ff9800" />
            <h3>{doctors.filter(d => d.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <h2>{translations[lang].doctorManagement}</h2>
      <p>{translations[lang].pageDoctorMgmtDesc}</p>

      {/* Search and Filter */}
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
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <table className="management-table">
        <thead>
          <tr>
            <th>{translations[lang].firstNameLastName}</th>
            <th>{translations[lang].email}</th>
            <th>Specialty</th>
            <th>Appointment Type</th>
            <th>{translations[lang].status}</th>
            <th>{translations[lang].action}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={6} />
          ) : filteredDoctors.length === 0 ? (
            <tr><td colSpan="6"><EmptyState message="No doctors found" icon={<FaUserMd size={48} />} /></td></tr>
          ) : (
            filteredDoctors.map((doc) => (
              <tr
                key={doc.id}
                className="clickable-row"
                onClick={() => handleRowClick(doc)}
              >
                <td>{doc.displayName || "N/A"}</td>
                <td>{doc.email || "N/A"}</td>
                <td>{doc.specialty || "N/A"}</td>
                <td>
                  <span className={`appointment-type-badge ${doc.appointmentType || 'both'}`}>
                    {doc.appointmentType === 'instant' ? '⚡ Instant' :
                     doc.appointmentType === 'advance' ? '📅 Advance' :
                     '⚡📅 Both'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${doc.status || 'pending'}`}>
                    {doc.status || 'pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {doc.status !== 'active' && (
                      <button
                        className="btn-icon btn-success"
                        onClick={(e) => handleApprove(e, doc)}
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      className="btn-icon btn-primary"
                      onClick={(e) => handleEdit(e, doc)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={(e) => handleDelete(e, doc)}
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd,
  FaEdit,
  FaTrash,
  FaCheck,
  FaSearch,
  FaUsers,
  FaUserTie,
  FaClock,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  db,
  updateUserProfile,
  deleteUser,
} from "../firebase";
import {
  LoadingSkeletonRow,
  EmptyState,
  AlertModal,
} from "../components/CommonComponents";
import { translations } from "../constants/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Separator,
} from "../components/ui";

// ==================== UserEditModal Component ====================
const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: "",
    specialty: "",
    hospital: "",
    age: "",
    gender: "",
    status: "active",
    appointmentType: "both",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        role: user.role || "patient",
        specialty: user.specialty || "",
        hospital: user.hospital || "",
        age: user.age || "",
        gender: user.gender || "",
        status: user.status || "active",
        appointmentType: user.appointmentType || "both",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="bg-muted"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Doctor-specific fields */}
            {formData.role === "doctor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input
                    id="hospital"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="appointmentType">
                    Appointment Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="appointmentType"
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="instant">Instant Only (หมอทันที)</option>
                    <option value="advance">Advance Only (นัดล่วงหน้า)</option>
                    <option value="both">Both (ทั้ง 2 แบบ)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    กำหนดว่าหมอคนนี้รับนัดแบบไหน
                  </p>
                </div>
              </>
            )}

            {/* Patient-specific fields */}
            {formData.role === "patient" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <Separator />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ==================== ApprovalManagementPage ====================
const ApprovalManagementPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    // ดึงรายการที่รอการอนุมัติ
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("accountStatus", "==", "pending"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingRequests(requests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId, requestedRole) => {
    setProcessing(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: requestedRole,
        accountStatus: "approved",
        requestedRole: null,
        approvedAt: new Date(),
      });
      alert("อนุมัติสำเร็จ!");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอนี้?")) return;

    setProcessing(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        accountStatus: "rejected",
        rejectedAt: new Date(),
      });
      alert("ปฏิเสธคำขอแล้ว");
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    } finally {
      setProcessing(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "doctor":
        return <FaUserMd size={24} color="#28a745" />;
      case "admin":
        return <FaUserTie size={24} color="#e6b800" />;
      default:
        return <FaUser size={24} color="#668ee0" />;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "doctor":
        return "แพทย์";
      case "admin":
        return "แอดมิน";
      default:
        return "คนไข้";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "#666",
        }}
      >
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "1.75rem",
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          <FaClock size={24} style={{ marginRight: "10px" }} />
          คำขออนุมัติบัญชี
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: "0.95rem",
            margin: 0,
          }}
        >
          จัดการคำขอสมัครเป็นแพทย์หรือแอดมิน
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <FaCheck size={48} color="#28a745" />
          <p>ไม่มีคำขอที่รอการอนุมัติ</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                padding: "1.5rem",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #f0f4ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "50px",
                    height: "50px",
                    background: "#f8faff",
                    borderRadius: "12px",
                  }}
                >
                  {getRoleIcon(request.requestedRole)}
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      color: "#1a1a1a",
                    }}
                  >
                    {request.displayName || "ไม่ระบุชื่อ"}
                  </h3>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.85rem",
                      color: "#666",
                    }}
                  >
                    {request.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "#666", fontWeight: 500 }}>
                    ต้องการเป็น:
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      backgroundColor:
                        request.requestedRole === "doctor"
                          ? "#28a74520"
                          : "#e6b80020",
                      color:
                        request.requestedRole === "doctor"
                          ? "#28a745"
                          : "#e6b800",
                    }}
                  >
                    {getRoleText(request.requestedRole)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "#666", fontWeight: 500 }}>
                    สมัครเมื่อ:
                  </span>
                  <span style={{ color: "#1a1a1a" }}>
                    {request.createdAt?.toDate
                      ? new Date(request.createdAt.toDate()).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "ไม่ทราบวันที่"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "#666", fontWeight: 500 }}>
                    สถานะปัจจุบัน:
                  </span>
                  <span style={{ color: "#1a1a1a" }}>
                    {getRoleText(request.role)} (ชั่วคราว)
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <button
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                    background: "#28a745",
                    color: "white",
                    opacity: processing === request.id ? 0.6 : 1,
                  }}
                  onClick={() =>
                    handleApprove(request.id, request.requestedRole)
                  }
                  disabled={processing === request.id}
                >
                  <FaCheck size={16} />
                  {processing === request.id ? "กำลังดำเนินการ..." : "อนุมัติ"}
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                    background: "#f44336",
                    color: "white",
                    opacity: processing === request.id ? 0.6 : 1,
                  }}
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                >
                  <FaTimes size={16} />
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== DoctorManagementPage ====================
const DoctorManagementPage = ({
  lang,
  db,
  isDirty,
  handleSaveProfile,
}) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        const doctorsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
    if (statusFilter !== "all") {
      result = result.filter((doc) => doc.status === statusFilter);
    }

    // Search by name or email
    if (searchTerm) {
      result = result.filter(
        (doc) =>
          doc.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    navigate(`/view-profile/${doc.id}`);
  };

  const handleApprove = async (e, doctor) => {
    e.stopPropagation();
    if (window.confirm(`Approve ${doctor.displayName || doctor.email}?`)) {
      try {
        await updateUserProfile(doctor.id, { status: "active" });
        setAlertModal({
          type: "success",
          title: "Success",
          message: "Doctor approved successfully!",
        });
      } catch {
        setAlertModal({
          type: "error",
          title: "Error",
          message: "Failed to approve doctor. Please try again.",
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
    if (
      window.confirm(
        `Are you sure you want to delete ${
          doctor.displayName || doctor.email
        }? This action cannot be undone.`
      )
    ) {
      try {
        await deleteUser(doctor.id);
        setAlertModal({
          type: "success",
          title: "Success",
          message: "Doctor deleted successfully!",
        });
      } catch {
        setAlertModal({
          type: "error",
          title: "Error",
          message: "Failed to delete doctor. Please try again.",
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
        type: "success",
        title: "Success",
        message: "User updated successfully!",
      });
    } catch {
      setAlertModal({
        type: "error",
        title: "Error",
        message: "Failed to update user. Please try again.",
      });
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "var(--md-surface)",
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <FaUserMd size={32} color="var(--primary-color)" />
            <h3
              style={{
                fontSize: "var(--md-display-small-size)",
                fontWeight: "var(--md-display-small-weight)",
                margin: 0,
                color: "var(--md-on-surface)",
              }}
            >
              {doctors.length}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "var(--md-body-medium-size)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              {translations[lang].totalDoctors}
            </p>
          </div>
          <div
            style={{
              background: "var(--md-surface)",
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <FaCheck size={32} color="#4caf50" />
            <h3
              style={{
                fontSize: "var(--md-display-small-size)",
                fontWeight: "var(--md-display-small-weight)",
                margin: 0,
                color: "var(--md-on-surface)",
              }}
            >
              {doctors.filter((d) => d.status === "active").length}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "var(--md-body-medium-size)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              Active
            </p>
          </div>
          <div
            style={{
              background: "var(--md-surface)",
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <FaUserMd size={32} color="#ff9800" />
            <h3
              style={{
                fontSize: "var(--md-display-small-size)",
                fontWeight: "var(--md-display-small-weight)",
                margin: 0,
                color: "var(--md-on-surface)",
              }}
            >
              {doctors.filter((d) => d.status === "pending").length}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "var(--md-body-medium-size)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              Pending
            </p>
          </div>
        </div>
      </div>

      <h2>{translations[lang].doctorManagement}</h2>
      <p>{translations[lang].pageDoctorMgmtDesc}</p>

      {/* Search and Filter */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)",
            background: "var(--md-surface)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: "var(--radius-input)",
            border: "1px solid var(--md-outline-variant)",
            transition: "var(--transition-normal)",
          }}
        >
          <FaSearch style={{ color: "var(--md-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "var(--md-body-medium-size)",
              background: "transparent",
              color: "var(--md-on-surface)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "var(--spacing-3) var(--spacing-4)",
            border: "1px solid var(--md-outline-variant)",
            borderRadius: "var(--radius-input)",
            background: "var(--md-surface)",
            fontSize: "var(--md-body-medium-size)",
            color: "var(--md-on-surface)",
            cursor: "pointer",
            outline: "none",
            transition: "var(--transition-normal)",
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <table
        style={{
          width: "100%",
          background: "var(--md-surface)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "var(--elevation-2)",
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#f8faff" }}>
          <tr>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].firstNameLastName}
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].email}
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              Specialty
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              Appointment Type
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].status}
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].action}
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={6} />
          ) : filteredDoctors.length === 0 ? (
            <tr>
              <td colSpan="6">
                <EmptyState
                  message="No doctors found"
                  icon={<FaUserMd size={48} />}
                />
              </td>
            </tr>
          ) : (
            filteredDoctors.map((doc) => (
              <tr
                key={doc.id}
                onClick={() => handleRowClick(doc)}
                style={{
                  cursor: "pointer",
                  transition: "background 0.2s",
                  borderBottom: "1px solid #f0f4ff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8faff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: "1rem" }}>{doc.displayName || "N/A"}</td>
                <td style={{ padding: "1rem" }}>{doc.email || "N/A"}</td>
                <td style={{ padding: "1rem" }}>{doc.specialty || "N/A"}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "14px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      ...(doc.appointmentType === "instant"
                        ? {
                            background:
                              "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                            color: "#e65100",
                            border: "1px solid #ffb74d",
                          }
                        : doc.appointmentType === "advance"
                        ? {
                            background:
                              "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                            color: "#1565c0",
                            border: "1px solid #64b5f6",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                            color: "#2e7d32",
                            border: "1px solid #81c784",
                          }),
                    }}
                  >
                    {doc.appointmentType === "instant"
                      ? "⚡ Instant"
                      : doc.appointmentType === "advance"
                      ? "📅 Advance"
                      : "⚡📅 Both"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      ...(doc.status === "active"
                        ? {
                            background: "#e8f5e9",
                            color: "#2e7d32",
                          }
                        : doc.status === "pending"
                        ? {
                            background: "#fff3e0",
                            color: "#e65100",
                          }
                        : {
                            background: "#f5f5f5",
                            color: "#616161",
                          }),
                    }}
                  >
                    {doc.status || "pending"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-start",
                    }}
                  >
                    {doc.status !== "active" && (
                      <button
                        onClick={(e) => handleApprove(e, doc)}
                        title="Approve"
                        style={{
                          padding: "0.5rem",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          background: "#28a74510",
                          color: "#1e7e34",
                          width: "36px",
                          height: "36px",
                        }}
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleEdit(e, doc)}
                      title="Edit"
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#6B9BF610",
                        color: "#0056b3",
                        width: "36px",
                        height: "36px",
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, doc)}
                      title="Delete"
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#f4433610",
                        color: "#c62828",
                        width: "36px",
                        height: "36px",
                      }}
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

// ==================== PatientManagementPage ====================
const PatientManagementPage = ({
  lang,
  db,
  isDirty,
  handleSaveProfile,
}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
        const patientsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
      result = result.filter(
        (p) =>
          p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    navigate(`/view-profile/${patient.id}`);
  };

  const handleEdit = (e, patient) => {
    e.stopPropagation();
    setEditingUser(patient);
  };

  const handleDelete = async (e, patient) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete ${
          patient.displayName || patient.email
        }? This action cannot be undone.`
      )
    ) {
      try {
        await deleteUser(patient.id);
        setAlertModal({
          type: "success",
          title: "Success",
          message: "Patient deleted successfully!",
        });
      } catch {
        setAlertModal({
          type: "error",
          title: "Error",
          message: "Failed to delete patient. Please try again.",
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
        type: "success",
        title: "Success",
        message: "User updated successfully!",
      });
    } catch {
      setAlertModal({
        type: "error",
        title: "Error",
        message: "Failed to update user. Please try again.",
      });
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "var(--md-surface)",
              borderRadius: "var(--radius-card)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <FaUsers size={32} color="var(--primary-color)" />
            <h3
              style={{
                fontSize: "var(--md-display-small-size)",
                fontWeight: "var(--md-display-small-weight)",
                margin: 0,
                color: "var(--md-on-surface)",
              }}
            >
              {patients.length}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "var(--md-body-medium-size)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              {translations[lang].totalPatients}
            </p>
          </div>
        </div>
      </div>

      <h2>{translations[lang].patientManagement}</h2>
      <p>{translations[lang].pagePatientMgmtDesc}</p>

      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)",
            background: "var(--md-surface)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: "var(--radius-input)",
            border: "1px solid var(--md-outline-variant)",
            transition: "var(--transition-normal)",
          }}
        >
          <FaSearch style={{ color: "var(--md-on-surface-variant)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "var(--md-body-medium-size)",
              background: "transparent",
              color: "var(--md-on-surface)",
            }}
          />
        </div>
      </div>

      <table
        style={{
          width: "100%",
          background: "var(--md-surface)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "var(--elevation-2)",
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#f8faff" }}>
          <tr>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].firstNameLastName}
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].email}
            </th>
            <th
              style={{
                padding: "1rem",
                textAlign: "left",
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #e8f0fe",
              }}
            >
              {translations[lang].action}
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={3} />
          ) : filteredPatients.length === 0 ? (
            <tr>
              <td colSpan="3">
                <EmptyState
                  message="No patients found"
                  icon={<FaUsers size={48} />}
                />
              </td>
            </tr>
          ) : (
            filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => handleRowClick(patient)}
                style={{
                  cursor: "pointer",
                  transition: "background 0.2s",
                  borderBottom: "1px solid #f0f4ff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8faff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={{ padding: "1rem" }}>
                  {patient.displayName || "N/A"}
                </td>
                <td style={{ padding: "1rem" }}>{patient.email || "N/A"}</td>
                <td style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-start",
                    }}
                  >
                    <button
                      onClick={(e) => handleEdit(e, patient)}
                      title="Edit"
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#6B9BF610",
                        color: "#0056b3",
                        width: "36px",
                        height: "36px",
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, patient)}
                      title="Delete"
                      style={{
                        padding: "0.5rem",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        background: "#f4433610",
                        color: "#c62828",
                        width: "36px",
                        height: "36px",
                      }}
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

// ==================== Exports ====================
export { ApprovalManagementPage, DoctorManagementPage, PatientManagementPage };
export default ApprovalManagementPage;

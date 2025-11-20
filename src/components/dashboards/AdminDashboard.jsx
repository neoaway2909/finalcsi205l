import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserAlt,
  FaUserCheck,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { collection, onSnapshot, query } from "firebase/firestore";
import "../Dashboards.css";
import { translations } from "../../constants/translations";
import { SideNav } from "../SideNav";
import { ProfilePage } from "../../pages/shared";
import { DoctorManagementPage, PatientManagementPage } from "../../pages/admin";
import ApprovalManagementPage from "../../pages/admin/ApprovalManagementPage";
import DashboardHeader from "../common/DashboardHeader";

// Helper function for initial profile data
const getInitialProfileData = (user) => ({
  name: user.name || user.displayName || "",
  specialty: user.specialty || "",
  data: user.data || "",
  dob: user.dob || "",
  medicalHistory: user.medicalHistory || ""
});

// Helper Component for rendering page content
const RenderAdminPageContent = ({
  activeNav,
  lang,
  setProfileToView,
  db,
  isProfileDirty,
  setIsProfileDirty,
  handleSaveProfile,
  profileData,
  setProfileData
}) => {
  switch (activeNav) {
    case 'approvals':
      return <ApprovalManagementPage lang={lang} db={db} />;
    case 'doctors':
      return <DoctorManagementPage lang={lang} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'patients':
      return <PatientManagementPage lang={lang} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <ApprovalManagementPage lang={lang} db={db} />;
  }
};

export const AdminDashboard = ({ user, logout, db }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp manually (descending - newest first)
        notifs.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return b.timestamp.seconds - a.timestamp.seconds;
        });
        setNotifications(notifs);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    );
    return () => unsubscribe();
  }, [db]);

  const activeNav = location.pathname.slice(1) || "doctors";

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/doctors', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (profileToView) {
      setProfileData(getInitialProfileData(profileToView));
      setIsProfileDirty(false);
    }
  }, [profileToView]);

  const handleSaveProfile = () => {
    alert("Profile Saved! (Demo)");
    setProfileToView(profileData);
    setIsProfileDirty(false);
  };

  const adminNavItems = [
    { id: "approvals", icon: FaUserCheck, label: { th: "คำขออนุมัติ", en: "Approvals" } },
    { id: "doctors", icon: FaUserMd, label: { th: "จัดการแพทย์", en: "Doctors" } },
    { id: "patients", icon: FaUsers, label: { th: "จัดการผู้ป่วย", en: "Patients" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  const userName = user?.displayName || "Admin";

  return (
    <div className="full-dashboard-layout">
      <DashboardHeader
        userName={userName}
        userRole="admin"
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        translations={translations}
        notifications={notifications}
      />
      <div className="body-wrapper">
        <SideNav
          logout={logout}
          activeNav={activeNav}
          navItems={adminNavItems}
          lang={activeLang}
          user={user}
          setProfileToView={setProfileToView}
          isDirty={isProfileDirty}
          setIsDirty={setIsProfileDirty}
          handleSaveProfile={handleSaveProfile}
        />
        <div className="content-container">
          <div className="main-content-area">
            <div className="content-body">
              <RenderAdminPageContent
                activeNav={activeNav}
                lang={activeLang}
                setProfileToView={setProfileToView}
                db={db}
                profileData={profileData}
                setProfileData={setProfileData}
                isProfileDirty={isProfileDirty}
                setIsProfileDirty={setIsProfileDirty}
                handleSaveProfile={handleSaveProfile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaListAlt,
  FaComments,
  FaUserAlt,
} from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import "../Dashboards.css";
import { translations } from "../../constants/translations";
import { SideNav } from "../SideNav";
import { ChatPage, ProfilePage } from "../../pages/shared";
import { QueuePage } from "../../pages/doctor";
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
const RenderDoctorPageContent = ({
  activeNav,
  lang,
  isProfileDirty,
  setIsProfileDirty,
  handleSaveProfile,
  profileData,
  setProfileData,
  db
}) => {
  switch (activeNav) {
    case 'queue':
      return <QueuePage lang={lang} db={db} />;
    case 'messages':
      return <ChatPage lang={lang} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <QueuePage lang={lang} db={db} />;
  }
};

export const DoctorDashboard = ({ user, logout, db }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, "notifications"), where("doctorId", "==", user.uid));
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
  }, [db, user]);

  const activeNav = location.pathname.slice(1) || "queue";

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/queue', { replace: true });
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

  const doctorNavItems = [
    { id: "queue", icon: FaListAlt, label: { th: "จัดการคิว", en: "Queue" } },
    { id: "messages", icon: FaComments, label: { th: "แชท", en: "Chat" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  const userName = user?.displayName || "Doctor";

  return (
    <div className="full-dashboard-layout">
      <DashboardHeader
        userName={userName}
        userRole="doctor"
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        translations={translations}
        notifications={notifications}
      />
      <div className="body-wrapper">
        <SideNav
          logout={logout}
          activeNav={activeNav}
          navItems={doctorNavItems}
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
              <RenderDoctorPageContent
                activeNav={activeNav}
                lang={activeLang}
                profileData={profileData}
                setProfileData={setProfileData}
                isProfileDirty={isProfileDirty}
                setIsProfileDirty={setIsProfileDirty}
                handleSaveProfile={handleSaveProfile}
                db={db}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaUserAlt,
  FaListAlt,
  FaUserShield,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import "./Dashboards.css";
import LogoImage from "../assets/logo.png";
import BotIcon from "../assets/ask ai.png";
import { translations } from "../constants/translations";
import { SideNav } from "./SideNav";
import { HomePage, AppointmentsPage } from "../pages/patient";
import { ChatPage, ProfilePage } from "../pages/shared";
import { QueuePage } from "../pages/doctor";
import { DoctorManagementPage, PatientManagementPage } from "../pages/admin";

// Helper function for initial profile data
const getInitialProfileData = (user) => ({
  name: user.name || user.displayName || "",
  specialty: user.specialty || "",
  data: user.data || "",
  dob: user.dob || "",
  medicalHistory: user.medicalHistory || ""
});

// Helper Component (Patient)
const RenderPageContent = ({
  activeNav, userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData
}) => {
  switch (activeNav) {
    case 'home':
      return <HomePage userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} />;
    case 'appointments':
      return <AppointmentsPage lang={lang} />;
    case 'messages':
      return <ChatPage lang={lang} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <HomePage userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} />;
  }
};

// Helper Component (Doctor)
const RenderDoctorPageContent = ({ activeNav, lang, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData }) => {
  switch (activeNav) {
    case 'queue':
      return <QueuePage lang={lang} />;
    case 'messages':
      return <ChatPage lang={lang} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <QueuePage lang={lang} />;
  }
};

// Helper Component (Admin)
const RenderAdminPageContent = ({ activeNav, lang, setProfileToView, db, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData }) => {
  switch (activeNav) {
    case 'doctors':
      return <DoctorManagementPage lang={lang} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'patients':
      return <PatientManagementPage lang={lang} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <DoctorManagementPage lang={lang} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
  }
};

// --- PatientDashboard ---
export const PatientDashboard = ({ user, logout, db }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("instant");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

  const activeNav = location.pathname.slice(1) || "home";

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, []);

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

  const navItems = [
    { id: "home", icon: FaHome, label: { th: "หน้าหลัก", en: "Home" } },
    { id: "appointments", icon: FaCalendarAlt, label: { th: "นัดหมาย", en: "Appointment" } },
    { id: "messages", icon: FaComments, label: { th: "แชท", en: "Chat" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const doctorsCol = collection(db, "users");
    const q = query(doctorsCol, where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doctorsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.displayName || data.email,
            specialty: data.specialty || "General Medicine",
            hospital: data.hospital || "Affiliated Hospital",
            cases: data.cases || 0,
            price: data.price || 800,
            time: data.time || 30,
          };
        });
        setDoctors(doctorsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  const userName = user?.displayName || "First name";

  return (
    <div className="full-dashboard-layout">
      <div className="top-header-bar">
        <div className="logo-container-header">
          <div className="app-logo-header-icon">
            <img src={LogoImage} alt="CareConnect Logo" className="app-logo-img" />
          </div>
        </div>
        <div className="search-bar-header">
          <FaSearch size={20} color="#6B9BF6" style={{ marginRight: "12px" }} />
          <input type="text" placeholder={translations[activeLang].searchPlaceholder} />
        </div>
        <div className="header-actions-right">
          <div className="header-icon-wrapper notification-bell-container">
            <FaBell size={22} />
            <span className="notification-count">3</span>
            <div className="notification-dropdown">
              <div className="notification-item"><strong>ผลตรวจของคุณออกแล้ว</strong><p>ผลตรวจเลือดของคุณพร้อมให้ดาวน์โหลด</p><span>10 นาทีที่แล้ว</span></div>
              <div className="notification-item"><strong>ยืนยันนัดหมาย</strong><p>นัดหมายของคุณกับ นพ. สมชาย ได้รับการยืนยัน</p><span>1 ชั่วโมงที่แล้ว</span></div>
              <div className="notification-item"><strong>ข้อความใหม่</strong><p>คุณมีข้อความใหม่จากพยาบาล</p><span>3 ชั่วโมงที่แล้ว</span></div>
            </div>
          </div>
          <div className="profile-header-sm">
            <div className="user-icon-sm"><FaUser size={22} /></div>
            <div className="user-info-sm">
              <span className="name">{userName}</span>
              <span className="id-card">{translations[activeLang].idCardNumber}</span>
            </div>
            <div className="profile-dropdown">
              <div className={`language-item ${activeLang === 'th' ? 'active-lang' : ''}`} onClick={() => setActiveLang('th')}>TH</div>
              <div className={`language-item ${activeLang === 'en' ? 'active-lang' : ''}`} onClick={() => setActiveLang('en')}>ENG</div>
            </div>
          </div>
        </div>
      </div>
      <div className="body-wrapper">
        <SideNav
          logout={logout}
          activeNav={activeNav}
          navItems={navItems}
          lang={activeLang}
          user={user}
          setProfileToView={setProfileToView}
          isDirty={isProfileDirty}
          setIsDirty={setIsProfileDirty}
          handleSaveProfile={handleSaveProfile}
        />
        <div className="content-container anim-fade-in">
          <div className="main-content-area">
            <div className="content-body">
              <RenderPageContent
                activeNav={activeNav}
                userName={userName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoading={isLoading}
                doctors={doctors}
                BotIcon={BotIcon}
                lang={activeLang}
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

// --- DoctorDashboard ---
export const DoctorDashboard = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

  const activeNav = location.pathname.slice(1) || "queue";

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/queue', { replace: true });
    }
  }, []);

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
      <div className="top-header-bar">
        <div className="logo-container-header">
          <div className="app-logo-header-icon">
            <img src={LogoImage} alt="CareConnect Logo" className="app-logo-img" />
          </div>
        </div>
        <div className="search-bar-header">
          <FaSearch size={20} color="#6B9BF6" style={{ marginRight: "12px" }} />
          <input type="text" placeholder={translations[activeLang].searchPlaceholder} />
        </div>
        <div className="header-actions-right">
          <div className="header-icon-wrapper notification-bell-container">
            <FaBell size={22} />
            <span className="notification-count">1</span>
            <div className="notification-dropdown">
              <div className="notification-item"><strong>คนไข้รอในคิว</strong><p>คุณมี 1 คนไข้รอปรึกษา</p><span>1 นาทีที่แล้ว</span></div>
            </div>
          </div>
          <div className="profile-header-sm">
            <div className="user-icon-sm"><FaUser size={22} /></div>
            <div className="user-info-sm">
              <span className="name">{userName}</span>
              <span className="id-card">{translations[activeLang].idCardNumber}</span>
            </div>
            <div className="profile-dropdown">
              <div className={`language-item ${activeLang === 'th' ? 'active-lang' : ''}`} onClick={() => setActiveLang('th')}>TH</div>
              <div className={`language-item ${activeLang === 'en' ? 'active-lang' : ''}`} onClick={() => setActiveLang('en')}>ENG</div>
            </div>
          </div>
        </div>
      </div>
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
        <div className="content-container anim-fade-in">
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AdminDashboard ---
export const AdminDashboard = ({ user, logout, db }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

  const activeNav = location.pathname.slice(1) || "doctors";

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/doctors', { replace: true });
    }
  }, []);

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
    { id: "doctors", icon: FaUserMd, label: { th: "จัดการแพทย์", en: "Doctors" } },
    { id: "patients", icon: FaUsers, label: { th: "จัดการผู้ป่วย", en: "Patients" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  const userName = user?.displayName || "Admin";

  return (
    <div className="full-dashboard-layout">
      <div className="top-header-bar">
        <div className="logo-container-header">
          <div className="app-logo-header-icon">
            <img src={LogoImage} alt="CareConnect Logo" className="app-logo-img" />
          </div>
        </div>
        <div className="search-bar-header">
          <FaSearch size={20} color="#6B9BF6" style={{ marginRight: "12px" }} />
          <input type="text" placeholder={translations[activeLang].searchPlaceholder} />
        </div>
        <div className="header-actions-right">
          <div className="header-icon-wrapper notification-bell-container">
            <FaBell size={22} />
            <span className="notification-count">1</span>
            <div className="notification-dropdown">
              <div className="notification-item"><strong>มีแพทย์รออนุมัติ</strong><p>พญ. สุรีพร รอการอนุมัติ</p><span>1 วันที่แล้ว</span></div>
            </div>
          </div>
          <div className="profile-header-sm">
            <div className="user-icon-sm"><FaUserShield size={22} /></div>
            <div className="user-info-sm">
              <span className="name">{userName}</span>
              <span className="id-card">System Administrator</span>
            </div>
            <div className="profile-dropdown">
              <div className={`language-item ${activeLang === 'th' ? 'active-lang' : ''}`} onClick={() => setActiveLang('th')}>TH</div>
              <div className={`language-item ${activeLang === 'en' ? 'active-lang' : ''}`} onClick={() => setActiveLang('en')}>ENG</div>
            </div>
          </div>
        </div>
      </div>
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
        <div className="content-container anim-fade-in">
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

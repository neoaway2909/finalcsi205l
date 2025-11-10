import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaUserAlt,
  FaPlusCircle, 
  FaCalendarAlt as FaCalendarIcon,
  FaCheck,
  FaListAlt // (เพิ่มไอคอนสำหรับหมอ)
} from "react-icons/fa";
import "./Dashboard.css";
import LogoImage from "../assets/logo.png";
import BotIcon from "../assets/ask ai.png";
// import BannerIllustration from "../assets/your-banner-image.png"; 
import { collection, onSnapshot } from "firebase/firestore";

// --- START: ส่วนเก็บข้อความ 2 ภาษา ---
const translations = {
  th: {
    searchPlaceholder: "ค้นหาหมอ, แผนก...",
    idCardNumber: "หมายเลขบัตรประชาชน",
    welcomeBack: "ยินดีต้อนรับกลับ",
    howFeeling: "วันนี้คุณรู้สึกอย่างไร?",
    askAI: "ถาม AI",
    instantDoctor: "หมอทันที",
    bookAppointment: "นัดหมายล่วงหน้า",
    loadingDoctors: "กำลังโหลดรายชื่อแพทย์...",
    noDoctorsFound: "ไม่พบแพทย์",
    bookNow: "จองเลย",
    pageAppointments: "การนัดหมายของฉัน",
    pageAppointmentsDesc: "รายการนัดหมายที่กำลังจะมาถึงและที่ผ่านมาจะแสดงที่นี่",
    pageChat: "แชท",
    pageChatDesc: "ประวัติการแชทของคุณกับแพทย์และฝ่ายสนับสนุนจะอยู่ที่นี่",
    pageProfile: "โปรไฟล์ของฉัน",
    pageProfileDesc: "คุณสามารถแก้ไขข้อมูลส่วนตัวของคุณได้ที่นี่",
    accreditedBy: "รับรองโดย",
    case: "เคส",
    baht: "บาท",
    minute: "นาที",
    logout: "ออกจากระบบ",
    // Profile Page
    personalInformation: "ข้อมูลส่วนตัว",
    firstNameLastName: "ชื่อ-นามสกุล",
    specialty: "โรคเฉพาะทาง",
    data: "ข้อมูล",
    placeholder: "ข้อมูลเบื้องต้น",
    dayMonthYear: "วัน / เดือน / ปี",
    medicalHistory: "ประวัติการรักษา",
    medicalHistoryPlaceholder: "ยังไม่มีประวัติการรักษา",
    // Doctor Page
    queue: "จัดการคิว",
    pageQueueDesc: "รายการคิวและนัดหมายคนไข้ของคุณจะแสดงที่นี่"
  },
  en: {
    searchPlaceholder: "search for doctor, specialties",
    idCardNumber: "ID card number",
    welcomeBack: "Welcome back",
    howFeeling: "How are you feeling today?",
    askAI: "Ask AI",
    instantDoctor: "Instant Doctor",
    bookAppointment: "Book Appointment",
    loadingDoctors: "Loading doctors...",
    noDoctorsFound: "No doctors found.",
    bookNow: "Book Now",
    pageAppointments: "My Appointments",
    pageAppointmentsDesc: "Your upcoming and past appointments will be listed here.",
    pageChat: "Chat",
    pageChatDesc: "Your chat history with doctors and support will be here.",
    pageProfile: "My Profile",
    pageProfileDesc: "You will be able to edit your personal information here.",
    accreditedBy: "Accredited by",
    case: "case",
    baht: "Baht",
    minute: "minute",
    logout: "Logout",
    // Profile Page
    personalInformation: "Personal Information",
    firstNameLastName: "First name Last name",
    specialty: "Specific Disease",
    data: "Information",
    placeholder: "Placeholder",
    dayMonthYear: "Day / Month / Year",
    medicalHistory: "Medical History",
    medicalHistoryPlaceholder: "No medical history added yet.",
    // Doctor Page
    queue: "Queue",
    pageQueueDesc: "Your patient queue and appointments will be listed here."
  }
};
// --- END: ส่วนเก็บข้อความ 2 ภาษา ---


// --- Doctor Card ---
const DoctorCard = ({ name, specialty, hospital, cases, price, time, lang }) => (
  <div className="doctor-card">
    <div className="doctor-photo-placeholder">
      <FaUser size={32} color="#c0d1f0" />
    </div>
    <div className="info-section">
      <p className="name">{name}</p>
      <span className="specialty">{specialty}</span>
      <p className="details">{hospital}</p>
      <p className="details">{cases} {translations[lang].case}</p>
      <div className="accredited">{translations[lang].accreditedBy}</div>
    </div>
    <div className="price-section">
      <div>
        <span className="price">{price} {translations[lang].baht}</span>
        <span className="time">{time} {translations[lang].minute}</span>
      </div>
      <button className="book-now-btn">{translations[lang].bookNow}</button>
    </div>
  </div>
);

// Action Button
const ActionButton = ({ icon: Icon, label, isImage = false, imageSrc }) => (
  <div className="action-button-container">
    <div className="action-button">
      {isImage ? (
        <img src={imageSrc} alt={label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      ) : (
        <Icon size={24} color="#668ee0" />
      )}
    </div>
    <span className="label">{label}</span>
  </div>
);

// SideNav (ใช้ร่วมกันทั้ง Patient และ Doctor)
const SideNav = ({ logout, activeNav, setActiveNav, navItems, lang }) => (
  <div className="side-nav anim-slide-in-left">
    <nav className="nav-menu" style={{marginTop: '20px'}}>
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item-side ${
            activeNav === item.id ? "active" : ""
          }`}
          onClick={() => setActiveNav(item.id)}
          title={item.label[lang]}
        >
          <item.icon size={22} />
          <span className="nav-label">{item.label[lang]}</span>
        </div>
      ))}
      <div
        className="nav-item-side nav-item-logout"
        onClick={logout}
        title={translations[lang].logout}
      >
        <FaSignOutAlt size={22} />
        <span className="nav-label">{translations[lang].logout}</span>
      </div>
    </nav>
  </div>
);


// --- Page Components ---

// หน้า Home
const PageHome = ({ userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang }) => (
  <>
    <div className="main-banner-content">
      <div className="banner-text-content">
        <h2 className="banner-text">{translations[lang].welcomeBack}, {userName}!</h2>
        <p className="banner-subtext">{translations[lang].howFeeling}</p>
      </div>
      <div className="banner-illustration-placeholder">
        <span>(Illustration)</span>
      </div>
    </div>
    <div className="action-icons-row-large">
      <ActionButton 
        isImage={true}
        imageSrc={BotIcon}
        label={translations[lang].askAI} 
      />
    </div>
    <div className="tab-selector" style={{marginTop: '25px'}}>
      <span
        className={activeTab === "instant" ? "active-tab" : "inactive-tab"}
        onClick={() => setActiveTab("instant")}
      >
        {translations[lang].instantDoctor}
      </span>
      <span
        className={activeTab === "book" ? "active-tab" : "inactive-tab"}
        onClick={() => setActiveTab("book")}
      >
        {translations[lang].bookAppointment}
      </span>
    </div>
    <div className="doctor-list">
      {isLoading ? (
        <p style={{ textAlign: "center", color: "#666" }}>{translations[lang].loadingDoctors}</p>
      ) : doctors.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>{translations[lang].noDoctorsFound}</p>
      ) : (
        doctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            name={doc.name || "N/A"}
            specialty={doc.specialty || "N/A"}
            hospital={doc.hospital || "N/A"}
            cases={doc.cases || 0}
            price={doc.price || 0}
            time={doc.time || 0}
            lang={lang}
          />
        ))
      )}
    </div>
  </>
);

// หน้า Appointment (Patient)
const PageAppointments = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageAppointments}</h2>
    <p>{translations[lang].pageAppointmentsDesc}</p>
  </div>
);

// หน้า Chat (Shared)
const PageChat = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageChat}</h2>
    <p>{translations[lang].pageChatDesc}</p>
  </div>
);

// หน้า Profile (Shared)
const PageProfile = ({ lang }) => {
  const [profile, setProfile] = useState({
    name: "",
    specialty: "",
    data: "",
    dob: "",
    medicalHistory: ""
  });
  const [isEditingHistory, setIsEditingHistory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const autoGrow = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };
  
  const handleDateInput = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (e.nativeEvent.inputType !== 'deleteContentBackward') {
      if (value.length === 2 || value.length === 5) {
        value += '/';
      }
    }
    value = value.replace(/[\/]{2,}/g, '/');
    setProfile(prev => ({ ...prev, dob: value }));
  };

  return (
    <div className="profile-page-content">
      <div className="profile-section-card">
        <h3>{translations[lang].personalInformation}</h3>
        <div className="personal-info-box">
          <div className="profile-avatar-placeholder">
            <FaUser size={40} color="#9BB8DD" />
          </div>
          <div className="profile-text-info">
            <textarea
              rows="1"
              name="name"
              className="profile-input-name"
              placeholder={translations[lang].firstNameLastName}
              value={profile.name}
              onChange={handleChange}
              onInput={autoGrow}
            />
            <textarea
              rows="1"
              name="specialty"
              className="profile-input-specialty"
              placeholder={translations[lang].specialty}
              value={profile.specialty}
              onChange={handleChange}
              onInput={autoGrow}
            />
            <textarea
              rows="1"
              name="data"
              className="profile-input-data"
              placeholder={translations[lang].data}
              value={profile.data}
              onChange={handleChange}
              onInput={autoGrow}
            />
          </div>
        </div>
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].placeholder}</h3>
        <div className="profile-date-input-container">
          <input 
            type="text"
            name="dob" 
            placeholder={translations[lang].dayMonthYear} 
            className="profile-date-input"
            value={profile.dob}
            onInput={handleDateInput}
            maxLength="10" 
          />
          <FaCalendarIcon className="profile-date-icon" size={20} color="#9BB8DD" />
        </div>
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].medicalHistory}</h3>
        {isEditingHistory ? (
          <textarea
            name="medicalHistory"
            className="profile-input-textarea"
            placeholder={translations[lang].medicalHistoryPlaceholder}
            value={profile.medicalHistory}
            onChange={handleChange}
            onInput={autoGrow}
            autoFocus
          />
        ) : (
          <p className="medical-history-text">
            {profile.medicalHistory || translations[lang].medicalHistoryPlaceholder}
          </p>
        )}
        <button 
          className="add-medical-history-btn"
          onClick={() => setIsEditingHistory(!isEditingHistory)}
        >
          {isEditingHistory ? (
            <FaCheck size={28} color="#28a745" />
          ) : (
            <FaPlusCircle size={28} color="#668ee0" />
          )}
        </button>
      </div>
    </div>
  );
};

// --- START: หน้าใหม่สำหรับ Doctor ---
const PageDoctorQueue = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].queue}</h2>
    <p>{translations[lang].pageQueueDesc}</p>
    {/* (นี่คือที่ที่คุณจะใส่เนื้อหาสำหรับ "จัดการคิว") */}
  </div>
);
// --- END: หน้าใหม่สำหรับ Doctor ---


// Helper Component (Patient)
const RenderPageContent = ({ 
  activeNav, userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang 
}) => {
  switch (activeNav) {
    case 'home':
      return <PageHome 
                userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} 
                isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} 
              />;
    case 'appointments':
      return <PageAppointments lang={lang} />;
    case 'messages':
      return <PageChat lang={lang} />;
    case 'profile':
      return <PageProfile lang={lang} />;
    default:
      return <PageHome 
                userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} 
                isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} 
              />;
  }
};

// --- START: Helper Component (Doctor) ---
const RenderDoctorPageContent = ({ activeNav, lang }) => {
  switch (activeNav) {
    case 'queue': // (หน้าหลักของหมอคือ Queue)
      return <PageDoctorQueue lang={lang} />;
    case 'messages':
      return <PageChat lang={lang} />;
    case 'profile':
      return <PageProfile lang={lang} />; // (ใช้ Profile ร่วมกัน)
    default:
      return <PageDoctorQueue lang={lang} />;
  }
};
// --- END: Helper Component (Doctor) ---


// --- PatientDashboard ---
export const PatientDashboard = ({ user, logout, db }) => {
  const [activeTab, setActiveTab] = useState("instant");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [activeLang, setActiveLang] = useState('th');

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
    const doctorsCol = collection(db, "doctors");
    const unsubscribe = onSnapshot(
      doctorsCol,
      (snapshot) => {
        const doctorsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const userName = user?.displayName || "First name";

  return (
    <div className="full-dashboard-layout">
      {/* Header (สีฟ้า) */}
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
      {/* Body Wrapper (แถวที่ 2) */}
      <div className="body-wrapper"> 
        <SideNav
          logout={logout}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          navItems={navItems}
          lang={activeLang}
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- DashboardCard (ยังคงอยู่สำหรับ Admin) --- */
const DashboardCard = ({ title, role, user, logout }) => (
  <div
    style={{
      padding: "30px",
      margin: "20px auto",
      maxWidth: "600px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      backgroundColor:
        role === "admin"
          ? "#ffe0e0"
          : role === "doctor"
          ? "#e0ffea"
          : "#e0f0ff",
    }}
  >
    <h1 style={{ color: role === "admin" ? "#d9534f" : "#337ab7" }}>{title}</h1>
    <p>ยินดีต้อนรับ: {user.displayName || user.email}</p>
    <p>
      บทบาทของคุณคือ: <strong>{role.toUpperCase()}</strong>
    </p>
    <button onClick={logout}>ออกจากระบบ ({role.toUpperCase()})</button>
  </div>
);

// --- START: DoctorDashboard (เขียนใหม่ทั้งหมด) ---
export const DoctorDashboard = ({ user, logout, db }) => {
  const [activeNav, setActiveNav] = useState("queue"); // (หน้าแรกของหมอคือ 'queue')
  const [activeLang, setActiveLang] = useState('th');

  // เมนูสำหรับหมอ
  const doctorNavItems = [
    { id: "queue", icon: FaListAlt, label: { th: "จัดการคิว", en: "Queue" } },
    { id: "messages", icon: FaComments, label: { th: "แชท", en: "Chat" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  const userName = user?.displayName || "Doctor";

  return (
    <div className="full-dashboard-layout">
      {/* Header (ใช้ร่วมกัน) */}
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
      {/* Body Wrapper */}
      <div className="body-wrapper"> 
        <SideNav
          logout={logout}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          navItems={doctorNavItems}
          lang={activeLang}
        />
        <div className="content-container anim-fade-in">
          <div className="main-content-area">
            <div className="content-body">
              <RenderDoctorPageContent 
                activeNav={activeNav}
                lang={activeLang}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END: DoctorDashboard ---


export const AdminDashboard = (props) => (
  <DashboardCard {...props} title="หน้าควบคุมระบบสำหรับแอดมิน" role="admin" />
);
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
  FaListAlt,
  FaUserShield,
  FaUserMd,
  FaUsers,
  FaBoxOpen
} from "react-icons/fa";
import "./Dashboards.css"; // (ยืนยันว่ามี s)
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
    pageQueueDesc: "รายการคิวและนัดหมายคนไข้ของคุณจะแสดงที่นี่",
    // Admin Page
    adminDashboard: "แดชบอร์ด",
    doctorManagement: "จัดการแพทย์",
    patientManagement: "จัดการผู้ป่วย",
    totalPatients: "ผู้ป่วยทั้งหมด",
    totalDoctors: "แพทย์ทั้งหมด",
    pageDoctorMgmtDesc: "รายชื่อแพทย์ทั้งหมดในระบบ",
    pagePatientMgmtDesc: "รายชื่อผู้ป่วยทั้งหมดในระบบ",
    email: "อีเมล",
    status: "สถานะ",
    action: "ดำเนินการ",
    active: "ใช้งาน",
    pending: "รออนุมัติ",
    approve: "อนุมัติ",
    loadingPatients: "กำลังโหลดรายชื่อผู้ป่วย...",
    noPatientsFound: "ไม่พบผู้ป่วย",
    saveProfile: "บันทึกโปรไฟล์",
    confirmLeave: "ยืนยันการแก้ไขหรือไม่? (ตกลง = บันทึก, ยกเลิก = ไม่บันทึก)"
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
    pageQueueDesc: "Your patient queue and appointments will be listed here.",
    // Admin Page
    adminDashboard: "Dashboard",
    doctorManagement: "Doctor Management",
    patientManagement: "Patient Management",
    totalPatients: "Total Patients",
    totalDoctors: "Total Doctors",
    pageDoctorMgmtDesc: "List of all doctors in the system.",
    pagePatientMgmtDesc: "List of all patients in the system.",
    email: "Email",
    status: "Status",
    action: "Action",
    active: "Active",
    pending: "Pending",
    approve: "Approve",
    loadingPatients: "Loading patients...",
    noPatientsFound: "No patients found.",
    saveProfile: "Save Profile",
    confirmLeave: "Confirm changes? (OK = Save, Cancel = Don't Save)"
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
      <button className="btn btn-primary">{translations[lang].bookNow}</button>
    </div>
  </div>
);

// --- Loading/Empty State Components ---
const LoadingSkeletonCard = () => (
  <div className="doctor-card skeleton-card">
    <div className="doctor-photo-placeholder skeleton"></div>
    <div className="info-section">
      <p className="name skeleton skeleton-text"></p>
      <span className="specialty skeleton skeleton-text-short"></span>
      <p className="details skeleton skeleton-text-long"></p>
    </div>
    <div className="price-section">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  </div>
);
const LoadingSkeletonRow = ({ cols }) => (
  <tr>
    <td colSpan={cols}>
      <div className="skeleton-row">
        <span className="skeleton skeleton-text-long"></span>
      </div>
    </td>
  </tr>
);
const EmptyState = ({ icon, message }) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">{icon || <FaBoxOpen size={48} />}</div>
    <p>{message}</p>
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

// SideNav
const SideNav = ({ logout, activeNav, setActiveNav, navItems, lang, isDirty, setIsDirty, setProfileToView, user, handleSaveProfile }) => {
  
  const handleClick = (itemId) => {
    if (activeNav === 'profile' && isDirty) {
      if (window.confirm(translations[lang].confirmLeave)) {
        handleSaveProfile(); 
        setIsDirty(false); 
        setActiveNav(itemId);
      } else {
        setIsDirty(false); 
        setActiveNav(itemId);
      }
    } 
    else {
      if (itemId === 'profile') {
        setProfileToView(user);
      }
      setActiveNav(itemId);
    }
  };
  
  return (
    <div className="side-nav anim-slide-in-left">
      <nav className="nav-menu" style={{marginTop: '20px'}}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item-side ${
              activeNav === item.id ? "active" : ""
            }`}
            onClick={() => handleClick(item.id)}
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
};


// --- Page Components (Patient) ---
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
        <><LoadingSkeletonCard /><LoadingSkeletonCard /></>
      ) : doctors.length === 0 ? (
        <EmptyState message={translations[lang].noDoctorsFound} icon={<FaUserMd size={48} />} />
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
const PageAppointments = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageAppointments}</h2>
    <p>{translations[lang].pageAppointmentsDesc}</p>
  </div>
);

// --- Page Components (Shared) ---
const PageChat = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].pageChat}</h2>
    <p>{translations[lang].pageChatDesc}</p>
  </div>
);
const PageProfile = ({ lang, userToView, profileData, setProfileData, isDirty, setIsDirty, handleSaveAll }) => {
  const [isEditingHistory, setIsEditingHistory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };
  const autoGrow = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };
  const handleDateInput = (e) => {
    let value = e.target.value.replace(/[^0-9/]/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (e.nativeEvent.inputType !== 'deleteContentBackward') {
      if (value.length === 2 || value.length === 5) { value += '/'; }
    }
    value = value.replace(/[\/]{2,}/g, '/');
    setProfileData(prev => ({ ...prev, dob: value }));
    setIsDirty(true);
  };
  
  const handleMedicalHistorySave = () => {
    setIsEditingHistory(false);
    setIsDirty(true);
  };

  const onSave = () => {
    handleSaveAll(profileData); 
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
            <textarea rows="1" name="name" className="profile-input-name" placeholder={translations[lang].firstNameLastName} value={profileData.name} onChange={handleChange} onInput={autoGrow} />
            <textarea rows="1" name="specialty" className="profile-input-specialty" placeholder={translations[lang].specialty} value={profileData.specialty} onChange={handleChange} onInput={autoGrow} />
            <textarea rows="1" name="data" className="profile-input-data" placeholder={translations[lang].data} value={profileData.data} onChange={handleChange} onInput={autoGrow} />
          </div>
        </div>
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].placeholder}</h3>
        <div className="profile-date-input-container">
          <input type="text" name="dob" placeholder={translations[lang].dayMonthYear} className="profile-date-input" value={profileData.dob} onInput={handleDateInput} maxLength="10" />
          <FaCalendarIcon className="profile-date-icon" size={20} color="#9BB8DD" />
        </div>
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
      <div className="profile-section-card">
        <h3>{translations[lang].medicalHistory}</h3>
        {/* (ข้อ 1) เพิ่ม .medical-history-box กลับมาห่อ */}
        <div className="medical-history-box">
          {isEditingHistory ? (
            <textarea name="medicalHistory" className="profile-input-textarea" placeholder={translations[lang].medicalHistoryPlaceholder} value={profileData.medicalHistory} onChange={handleChange} onInput={autoGrow} autoFocus />
          ) : (
            <p className="medical-history-text">{profileData.medicalHistory || translations[lang].medicalHistoryPlaceholder}</p>
          )}
          <button className="add-medical-history-btn" onClick={() => isEditingHistory ? handleMedicalHistorySave() : setIsEditingHistory(true)}>
            {isEditingHistory ? (<FaCheck size={28} color="#28a745" />) : (<FaPlusCircle size={28} color="#668ee0" />)}
          </button>
        </div>
        {/* (ข้อ 1) ปุ่ม Save All จะแสดงผลโดย CSS ที่มุมขวาล่างของ Card นี้ */}
        {isDirty && (
          <button className="profile-save-btn" onClick={onSave}>
            <FaCheck size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Page Components (Doctor) ---
const PageDoctorQueue = ({ lang }) => (
  <div className="page-placeholder">
    <h2>{translations[lang].queue}</h2>
    <p>{translations[lang].pageQueueDesc}</p>
  </div>
);

// --- Page Components (Admin) ---
const PageDoctorManagement = ({ lang, setActiveNav, setProfileToView, db, isDirty, handleSaveProfile }) => { 
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const doctorsCol = collection(db, "doctors");
    const unsubscribe = onSnapshot(
      doctorsCol,
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
      } else {
        setIsDirty(false);
      }
    }
    setProfileToView(doc); 
    setActiveNav('profile');
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
                    <button className="btn btn-primary btn-approve" onClick={(e) => { e.stopPropagation(); /* (โค้ด Approve) */ }}>
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
const PagePatientManagement = ({ lang, setActiveNav, setProfileToView, db, isDirty, handleSaveProfile }) => { 
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const patientsCol = collection(db, "patients"); 
    const unsubscribe = onSnapshot(
      patientsCol,
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
      } else {
        setIsDirty(false);
      }
    }
    setProfileToView(patient);
    setActiveNav('profile');
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
// --- END: Page Components (Admin) ---


// Helper Component (Patient)
const RenderPageContent = ({ 
  activeNav, userName, activeTab, setActiveTab, isLoading, doctors, BotIcon, lang, profileToView, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData
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
      return <PageProfile 
                lang={lang} 
                userToView={profileToView} 
                profileData={profileData} 
                setProfileData={setProfileData} 
                isDirty={isProfileDirty} 
                setIsDirty={setIsProfileDirty} 
                handleSaveAll={handleSaveProfile} 
              />;
    default:
      return <PageHome 
                userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} 
                isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} 
              />;
  }
};

// Helper Component (Doctor)
const RenderDoctorPageContent = ({ activeNav, lang, profileToView, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData }) => {
  switch (activeNav) {
    case 'queue':
      return <PageDoctorQueue lang={lang} />;
    case 'messages':
      return <PageChat lang={lang} />;
    case 'profile':
      return <PageProfile 
                lang={lang} 
                userToView={profileToView} 
                profileData={profileData} 
                setProfileData={setProfileData}
                isDirty={isProfileDirty} 
                setIsDirty={setIsProfileDirty} 
                handleSaveAll={handleSaveProfile} 
              />;
    default:
      return <PageDoctorQueue lang={lang} />;
  }
};

// Helper Component (Admin)
const RenderAdminPageContent = ({ activeNav, lang, setActiveNav, setProfileToView, db, profileToView, isProfileDirty, setIsProfileDirty, handleSaveProfile, profileData, setProfileData }) => { 
  switch (activeNav) {
    case 'doctors':
      return <PageDoctorManagement lang={lang} setActiveNav={setActiveNav} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'patients':
      return <PagePatientManagement lang={lang} setActiveNav={setActiveNav} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
    case 'profile':
      return <PageProfile 
                lang={lang} 
                userToView={profileToView} 
                profileData={profileData} 
                setProfileData={setProfileData}
                isDirty={isProfileDirty} 
                setIsDirty={setIsProfileDirty} 
                handleSaveAll={handleSaveProfile} 
              />;
    default:
      return <PageDoctorManagement lang={lang} setActiveNav={setActiveNav} setProfileToView={setProfileToView} db={db} isDirty={isProfileDirty} handleSaveProfile={handleSaveProfile} />;
  }
};


// (ฟังก์ชันสำหรับดึงข้อมูลเริ่มต้นของ Profile)
const getInitialProfileData = (user) => ({
  name: user.name || user.displayName || "",
  specialty: user.specialty || "",
  data: user.data || "",
  dob: user.dob || "",
  medicalHistory: user.medicalHistory || ""
});

// --- PatientDashboard ---
export const PatientDashboard = ({ user, logout, db }) => {
  const [activeTab, setActiveTab] = useState("instant");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

  useEffect(() => {
    if (profileToView) {
      setProfileData(getInitialProfileData(profileToView));
      setIsProfileDirty(false); // (รีเซ็ตทุกครั้งที่เปลี่ยนคนดู)
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
                profileToView={profileToView}
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


// --- DoctorDashboard (อัปเดตแล้ว) ---
export const DoctorDashboard = ({ user, logout, db }) => {
  const [activeNav, setActiveNav] = useState("queue");
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

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
                profileToView={profileToView}
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

// --- AdminDashboard (อัปเดตแล้ว) ---
export const AdminDashboard = ({ user, logout, db }) => {
  const [activeNav, setActiveNav] = useState("doctors");
  const [activeLang, setActiveLang] = useState('th');
  const [profileToView, setProfileToView] = useState(user);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [profileData, setProfileData] = useState(() => getInitialProfileData(user));

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
      {/* Body Wrapper */}
      <div className="body-wrapper"> 
        <SideNav
          logout={logout}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
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
                setActiveNav={setActiveNav} 
                setProfileToView={setProfileToView}
                db={db}
                profileToView={profileToView}
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
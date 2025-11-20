import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaUserAlt,
} from "react-icons/fa";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import "../Dashboards.css";
import BotIcon from "../../assets/ask ai.png";
import { translations } from "../../constants/translations";
import { SideNav } from "../SideNav";
import { HomePage, AppointmentsPage } from "../../pages/patient";
import { ChatPage, ProfilePage } from "../../pages/shared";
import BookingPage from "../../pages/patient/BookingPage";
import AboutDoctorPage from "../../pages/patient/AboutDoctorPage";
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
const RenderPageContent = ({
  activeNav,
  userName,
  activeTab,
  setActiveTab,
  isLoading,
  doctors,
  BotIcon,
  lang,
  isProfileDirty,
  setIsProfileDirty,
  handleSaveProfile,
  profileData,
  setProfileData,
  onBook,
  bookingDoctor,
  viewingDoctor,
  handleBackFromBooking,
  handleBackFromAbout,
  onBookingComplete,
  onBookAppointment,
  appointments,
  db,
  user,
  bookingTab,
  isInitializing
}) => {
  // Show skeleton loading while initializing to prevent flash of homepage
  if (isInitializing) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="skeleton-loader" style={{
          height: '200px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s ease-in-out infinite',
          borderRadius: '12px',
          marginBottom: '1rem'
        }} />
        <div className="skeleton-loader" style={{
          height: '400px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s ease-in-out infinite',
          borderRadius: '12px'
        }} />
        <style>{`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (bookingDoctor) {
    return <BookingPage doctor={bookingDoctor} onBack={handleBackFromBooking} lang={lang} onBookingComplete={onBookingComplete} db={db} user={user} bookingTab={bookingTab} />;
  }

  if (viewingDoctor) {
    return <AboutDoctorPage doctor={viewingDoctor} onBack={handleBackFromAbout} onBookAppointment={() => onBookAppointment(viewingDoctor)} lang={lang} />;
  }

  switch (activeNav) {
    case 'home':
      return <HomePage userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} onBook={onBook} />;
    case 'appointments':
      return <AppointmentsPage lang={lang} appointments={appointments} />;
    case 'messages':
      return <ChatPage lang={lang} />;
    case 'profile':
      return <ProfilePage lang={lang} profileData={profileData} setProfileData={setProfileData} isDirty={isProfileDirty} setIsDirty={setIsProfileDirty} handleSaveAll={handleSaveProfile} />;
    default:
      return <HomePage userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} isLoading={isLoading} doctors={doctors} BotIcon={BotIcon} lang={lang} onBook={onBook} />;
  }
};

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
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bookingTab, setBookingTab] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Read URL path params to set initial viewing/booking state
  // Format: /doctor/:tab/:doctorId or /booking/:tab/:doctorId
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // pathParts = ['doctor', 'instant', 'doctorId'] or ['booking', 'instant', 'doctorId']

    if (pathParts.length >= 3 && doctors.length > 0) {
      const action = pathParts[0]; // 'doctor' or 'booking'
      const tabParam = pathParts[1]; // 'instant' or 'book'
      const doctorId = pathParts[2];

      if (action === 'booking') {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          setBookingDoctor(doctor);
          setViewingDoctor(null);
          setBookingTab(tabParam);
        }
        setIsInitializing(false);
      } else if (action === 'doctor') {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          setViewingDoctor(doctor);
          setBookingDoctor(null);
          setBookingTab(tabParam);
        }
        setIsInitializing(false);
      } else {
        setIsInitializing(false);
      }
    } else if (pathParts.length < 3 || (pathParts[0] !== 'doctor' && pathParts[0] !== 'booking')) {
      // Not a doctor/booking route, show content immediately
      setBookingDoctor(null);
      setViewingDoctor(null);
      setBookingTab(null);
      setIsInitializing(false);
    }
    // If doctors.length === 0, keep waiting
  }, [location.pathname, doctors]);

  const handleViewDoctor = (doctor) => {
    navigate(`/doctor/${activeTab}/${doctor.id}`);
  };

  const handleBookAppointment = (doctor) => {
    navigate(`/booking/${activeTab}/${doctor.id}`);
  };

  const handleBackFromBooking = () => {
    if (bookingDoctor && bookingTab) {
      navigate(`/doctor/${bookingTab}/${bookingDoctor.id}`);
    } else {
      navigate('/home');
    }
  };

  const handleBackFromAbout = () => {
    navigate('/home');
  };

  const handleBookingComplete = () => {
    navigate('/home');
  };

  // Extract the first path segment as the active nav
  // /doctor and /booking should show "home" as active in sidebar
  const pathSegment = location.pathname.split('/').filter(Boolean)[0] || "home";
  const activeNav = (pathSegment === 'doctor' || pathSegment === 'booking') ? 'home' : pathSegment;

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home', { replace: true });
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

  const navItems = [
    { id: "home", icon: FaHome, label: { th: "หน้าหลัก", en: "Home" } },
    { id: "appointments", icon: FaCalendarAlt, label: { th: "นัดหมาย", en: "Appointment" } },
    { id: "messages", icon: FaComments, label: { th: "แชท", en: "Chat" } },
    { id: "profile", icon: FaUserAlt, label: { th: "โปรไฟล์", en: "Profile" } },
  ];

  useEffect(() => {
    if (!db) {
      console.log("DB is not initialized");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    console.log("Fetching doctors from Firestore...");
    const doctorsCol = collection(db, "users");
    const q = query(doctorsCol, where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`Found ${snapshot.docs.length} doctors`);
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
            appointmentType: data.appointmentType || "both", // "instant", "advance", or "both"
          };
        });
        setDoctors(doctorsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching doctors:", error);
        console.error("Error details:", error.code, error.message);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!db || !user) {
      console.log("DB or user not available for appointments");
      return;
    }

    console.log(`Fetching appointments for user: ${user.uid}`);
    const appointmentsCol = collection(db, "appointments");
    const q = query(appointmentsCol, where("patientId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(`Found ${snapshot.docs.length} appointments`);
        const appointmentsList = await Promise.all(
          snapshot.docs.map(async (appointmentDoc) => {
            const appointmentData = appointmentDoc.data();
            // Fetch doctor details
            const doctorDocRef = doc(db, "users", appointmentData.doctorId);
            const doctorDoc = await getDoc(doctorDocRef);
            const doctorData = doctorDoc.exists() ? doctorDoc.data() : {};

            return {
              id: appointmentDoc.id,
              date: appointmentData.date,
              time: appointmentData.time,
              status: appointmentData.status,
              doctor: {
                id: appointmentData.doctorId,
                name: doctorData.displayName || "Unknown Doctor",
                specialty: doctorData.specialty || "General Medicine",
                hospital: doctorData.hospital || "Affiliated Hospital",
                price: doctorData.price || 800,
                time: doctorData.time || 30,
              }
            };
          })
        );
        console.log("Appointments data:", appointmentsList);
        setAppointments(appointmentsList);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        console.error("Error details:", error.code, error.message);
        setAppointments([]);
      }
    );
    return () => unsubscribe();
  }, [db, user]);

  const userName = user?.displayName || "First name";

  const patientNotifications = [
    { id: 1, title: 'ผลตรวจของคุณออกแล้ว', description: 'ผลตรวจเลือดของคุณพร้อมให้ดาวน์โหลด', time: '10 นาทีที่แล้ว' },
    { id: 2, title: 'ยืนยันนัดหมาย', description: 'นัดหมายของคุณกับ นพ. สมชาย ได้รับการยืนยัน', time: '1 ชั่วโมงที่แล้ว' },
    { id: 3, title: 'ข้อความใหม่', description: 'คุณมีข้อความใหม่จากพยาบาล', time: '3 ชั่วโมงที่แล้ว' }
  ];

  return (
    <div className="full-dashboard-layout">
      <DashboardHeader
        userName={userName}
        userRole="patient"
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        translations={translations}
        notifications={patientNotifications}
      />
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
        <div className="content-container">
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
                onBook={handleViewDoctor}
                bookingDoctor={bookingDoctor}
                viewingDoctor={viewingDoctor}
                handleBackFromBooking={handleBackFromBooking}
                handleBackFromAbout={handleBackFromAbout}
                onBookingComplete={handleBookingComplete}
                onBookAppointment={handleBookAppointment}
                appointments={appointments}
                db={db}
                user={user}
                bookingTab={bookingTab}
                isInitializing={isInitializing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

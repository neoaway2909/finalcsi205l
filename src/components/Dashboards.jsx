import React, { useState } from "react";
import {
  FaUser,
  FaBell,
  FaSearch,
  FaHandshake,
  FaCapsules,
  FaShoppingCart,
  FaHeartbeat,
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaUserAlt,
  FaSignOutAlt,
  FaUserMd,
  FaUserTie,
  FaPlus,
  FaIdCard,
} from "react-icons/fa";
import "./Dashboard.css";

// Component ย่อย: Doctor Card
const DoctorCard = ({ name, specialty, hospital, cases, price, time }) => (
  <div className="doctor-card">
    <div className="profile-icon">
      <FaUser size={24} color="#666" />
    </div>
    <div className="info-section">
      <p className="name">{name}</p>
      <span className="specialty">{specialty}</span>
      <p className="details">{hospital}</p>
      <p className="details">{cases} case</p>
      <div className="accredited">Accredited by</div>
    </div>
    <div className="price-section">
      <img
        src="https://placehold.co/40x40/f4e4e9/800000?text=P"
        alt="Doctor Profile"
        className="profile-placeholder-small"
        style={{ borderRadius: "50%", marginBottom: "5px" }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/40x40/ccc/white?text=Dr";
        }}
      />
      <span className="price">{price} Baht</span>
      <span className="time">{time} minute</span>
    </div>
  </div>
);

// Component ย่อย: Action Button (สำหรับ Ask AI, Pharmacy, etc.)
const ActionButton = ({ icon: Icon, label }) => (
  <div className="action-button-container">
    <div className="action-button">
      <Icon size={24} color="#668ee0" />
    </div>
    <span className="label">{label}</span>
  </div>
);

// Component ย่อย: Side Navigation Bar
const SideNav = ({ logout }) => (
  <div className="side-nav">
    <div className="logo-container">
      <div className="app-logo-icon">
        <FaPlus size={24} color="white" />
      </div>
      <p className="app-logo-text">CareConnect</p>
    </div>

    <nav className="nav-menu">
      <div className="nav-item-side active">
        <FaHome size={20} />
        <span><Homei></Homei></span>
      </div>
      <div className="nav-item-side">
        <FaCalendarAlt size={20} />
        <span>Appointment</span>
      </div>
      <div className="nav-item-side">
        <FaComments size={20} />
        <span>Chat</span>
      </div>
      <div className="nav-item-side">
        <FaUserAlt size={20} />
        <span>Profile</span>
      </div>
      <div className="nav-item-side logout" onClick={logout}>
        <FaSignOutAlt size={20} />
        <span>Logout</span>
      </div>
    </nav>
  </div>
);

// Component หลัก: Patient Dashboard (แก้ไขโครงสร้าง)
export const PatientDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState("instant");

  // Mock Data
  const doctorData = [
    {
      name: "First name Last name",
      specialty: "Specialty",
      hospital: "Affiliated Hospital",
      cases: "6566",
      price: "800",
      time: "30",
    },
    {
      name: "Jane Smith",
      specialty: "Pediatrician",
      hospital: "City General",
      cases: "412",
      price: "1200",
      time: "45",
    },
    // เพิ่มอีก 1 รายการเพื่อการจัดเรียง
    {
      name: "Dr. Third Example",
      specialty: "Dermatologist",
      hospital: "New Clinic",
      cases: "200",
      price: "1000",
      time: "30",
    },
  ];

  return (
    <div className="full-dashboard-layout">
      {" "}
      {/* Container หลักสำหรับ Layout 2 คอลัมน์ */}
      <SideNav logout={logout} />
      <div className="main-content-area">
        {" "}
        {/* คอลัมน์หลักสำหรับเนื้อหา */}
        {/* 1. Header และ Profile */}
        <div className="top-header-bar">
          <div className="search-bar-header">
            <FaSearch size={18} color="#666" style={{ marginRight: "10px" }} />
            <input type="text" placeholder="search for doctor, specialties" />
          </div>

          <FaBell size={24} color="#666" style={{ margin: "0 15px" }} />

          <div className="profile-header-sm">
            <div className="user-info-sm">
              <span className="name">{user.displayName || user.email}</span>
              <span className="id-card">ID card number</span>
            </div>
            <div className="user-icon-sm">
              <FaUser size={24} color="#666" />
            </div>
          </div>
        </div>
        {/* 2. Content Area */}
        <div className="content-body">
          {/* 3. Main Info/Banner Area (กล่องสีฟ้าอ่อน) */}
          <div className="main-banner-content">
            {/* อาจใส่ข้อความต้อนรับหรือแบนเนอร์ */}
          </div>

          {/* 4. Action Icons */}
          <div className="action-icons-row-large">
            <ActionButton icon={FaUser} label="Ask AI" />
            <ActionButton icon={FaShoppingCart} label="Pharmacy" />
            <ActionButton icon={FaCapsules} label="Get Vaccinated" />
          </div>

          {/* 5. Tab Selector */}
          <div className="tab-selector">
            <span
              className={
                activeTab === "instant" ? "active-tab" : "inactive-tab"
              }
              onClick={() => setActiveTab("instant")}
            >
              Instant Doctor
            </span>
            <span
              className={activeTab === "book" ? "active-tab" : "inactive-tab"}
              onClick={() => setActiveTab("book")}
            >
              Book Appointment
            </span>
          </div>

          {/* 6. Doctor List */}
          <div className="doctor-list">
            {doctorData.map((doc, index) => (
              <DoctorCard key={index} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Mock-up สำหรับ Dashboard อื่นๆ (คงไว้เพื่อไม่ให้เกิด Error)
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

export const DoctorDashboard = (props) => (
  <DashboardCard
    {...props}
    title="หน้าจัดการคิวและแชทสำหรับแพทย์"
    role="doctor"
  />
);

export const AdminDashboard = (props) => (
  <DashboardCard {...props} title="หน้าควบคุมระบบสำหรับแอดมิน" role="admin" />
);

import React, { useState, useEffect } from "react"; // 1. Import useEffect

import {

  FaUser,

  FaBell,

  FaSearch,

  FaHandshake, // ใช้ไอคอนนี้แทน "Ask AI"

  FaCapsules,

  FaShoppingCart,

  FaHome,

  FaCalendarAlt,

  FaComments,

  FaUserAlt,

  FaPlus,

  FaSignOutAlt, // 1. เพิ่มไอคอน Logout

} from "react-icons/fa";

// ตรวจสอบว่าคุณ import CSS ไฟล์นี้ถูกต้อง

import "./Dashboard.css";



// 2. Import เครื่องมือ Firestore

import { collection, onSnapshot } from "firebase/firestore";



// Component ย่อย: Doctor Card (คงเดิม)

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

      {/* ลบรูปภาพ placeholder ออกตามดีไซน์ */ }

      <span className="price">{price} Baht</span>

      <span className="time">{time} minute</span>

    </div>

  </div>

);



// Component ย่อย: Action Button (คงเดิม)

const ActionButton = ({ icon: Icon, label }) => (

  <div className="action-button-container">

    <div className="action-button">

      <Icon size={24} color="#668ee0" />

    </div>

    <span className="label">{label}</span>

  </div>

);



// Component ย่อย: Side Navigation Bar (Icon-Only) (คงเดิม)

const SideNav = ({ logout }) => (

  <div className="side-nav">

    <nav className="nav-menu">

      <div className="nav-item-side active">

        <FaHome size={24} />

      </div>

      <div className="nav-item-side">

        <FaCalendarAlt size={24} />

      </div>

      <div className="nav-item-side">

        <FaComments size={24} />

      </div>

      <div className="nav-item-side">

        <FaUserAlt size={24} />

      </div>



      {/* 3. เพิ่มปุ่ม Logout ที่นี่ */}

      <div className="nav-item-side nav-item-logout" onClick={logout}>

        <FaSignOutAlt size={24} />

      </div>

    </nav>

  </div>

);



// Component หลัก: Patient Dashboard (โครงสร้างใหม่)

// 3. รับ 'db' (Firestore instance) เข้ามาเป็น prop

export const PatientDashboard = ({ user, logout, db }) => {

  const [activeTab, setActiveTab] = useState("instant");



  // 4. สร้าง State ไว้รอรับข้อมูลจริง และสถานะ Loading

  const [doctors, setDoctors] = useState([]);

  const [isLoading, setIsLoading] = useState(true);



  // 5. ลบ Mock Data (doctorData) ออก



  // 6. เพิ่ม useEffect เพื่อดึงข้อมูลจาก Firebase

  useEffect(() => {

    // ถ้า db ยังไม่พร้อม (ยังไม่ถูกส่งมา) ก็ไม่ต้องทำอะไร

    if (!db) {

      setIsLoading(false);

      return;

    }



    setIsLoading(true);



    // TODO: แก้ "doctors" ให้เป็นชื่อ Collection ของคุณ

    // (เช่น 'artifacts/YOUR_APP_ID/public/data/doctors')

    

    // MODIFIED: เปลี่ยน "dotor" กลับไปเป็น "doctors" ให้ตรงกับ Firebase

    const doctorsCol = collection(db, "doctors"); 



    // onSnapshot จะคอย "ฟัง" การเปลี่ยนแปลงข้อมูลแบบ Real-time

    const unsubscribe = onSnapshot(doctorsCol, (snapshot) => {

      const doctorsList = snapshot.docs.map(doc => ({

        id: doc.id, // เก็บ ID ของเอกสารไว้ด้วย

        ...doc.data()

      }));

      setDoctors(doctorsList); // อัปเดตข้อมูลหมอใน State

      setIsLoading(false); // โหลดเสร็จแล้ว

    }, (error) => {

      // กรณีดึงข้อมูลไม่สำเร็จ

      console.error("Error fetching doctors: ", error);

      setIsLoading(false);

    });



    // Cleanup: หยุดฟังข้อมูลเมื่อ Component นี้ถูกปิด

    return () => unsubscribe();



  }, [db]); // สั่งให้ useEffect นี้ทำงานใหม่ ถ้า 'db' มีการเปลี่ยนแปลง



  return (

    <div className="full-dashboard-layout">

      {/* 1. Logo (อยู่ด้านนอกกล่องขาว) */}

      <div className="logo-container-main">

        <div className="app-logo-icon">

          <FaPlus size={30} color="white" />

        </div>

        <p className="app-logo-text">CareConnect</p>

      </div>



      {/* 2. Header Bar (อยู่ด้านนอกกล่องขาว) */}

      <div className="top-header-bar">

        <div className="search-bar-header">

          <FaSearch size={20} color="#999" style={{ marginRight: "12px" }} />

          <input type="text" placeholder="search for doctor, specialties" />

        </div>



        <div className="header-icon-wrapper">

          <FaBell size={20} color="#666" />

        </div>



        <div className="profile-header-sm">

          <div className="user-icon-sm">

            <FaUser size={20} color="#666" />

          </div>

          <div className="user-info-sm">

            <span className="name">{user.displayName || "First name"}</span>

            <span className="id-card">ID card number</span>

          </div>

        </div>

      </div>



      {/* 3. กล่องเนื้อหาสีขาวหลัก (Main Content Box) */}

      <div className="content-container">

        {/* 3A. SideNav (อยู่ข้างใน) */}

        {/* 4. ส่ง prop 'logout' เข้าไป */}

        <SideNav logout={logout} />



        {/* 3B. Main Content Area (อยู่ข้างใน) */}

        <div className="main-content-area">

          <div className="content-body">

            {/* Banner */}

            <div className="main-banner-content">

              {/* Placeholder for banner content */}

            </div>



            {/* Action Icons */}

            <div className="action-icons-row-large">

              <ActionButton icon={FaHandshake} label="Ask AI" />

              {/* <ActionButton icon={FaShoppingCart} label="Pharmacy" /> --- REMOVED --- */}

              {/* <ActionButton icon={FaCapsules} label="Get Vaccinated" /> --- REMOVED --- */}

            </div>



            {/* Tab Selector */}

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



            {/* 7. Doctor List - อัปเดตให้ใช้ข้อมูลจริง + Loading */}

            <div className="doctor-list">

              {isLoading ? (

                <p style={{ textAlign: 'center', color: '#666' }}>Loading doctors...</p>

              ) : doctors.length === 0 ? (

                <p style={{ textAlign: 'center', color: '#999' }}>No doctors found.</p>

              ) : (

                doctors.map((doc) => (

                  // ตรวจสอบว่า field ที่จำเป็นมีอยู่จริงก่อนส่งเข้า Card

                  <DoctorCard 

                    key={doc.id} 

                    name={doc.name || "N/A"}

                    specialty={doc.specialty || "N/A"}

                    hospital={doc.hospital || "N/A"}

                    cases={doc.cases || 0}

                    price={doc.price || 0}

                    time={doc.time || 0}

                  />

                ))

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};



/* --- Mock-ups (คงเดิม) --- */

// (ส่วน DashboardCard, DoctorDashboard, AdminDashboard คงเดิม)

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
import React from "react";

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

    {/* --- ฟังก์ชันเฉพาะบทบาท --- */}
    <div
      style={{
        marginTop: "20px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
      }}
    >
      {role === "patient" && (
        <>
          <h3>ฟังก์ชันของคนไข้:</h3>
          <ul>
            <li>
              <a href="#" style={{ color: "#337ab7" }}>
                ค้นหาและจองคิวแพทย์
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "#337ab7" }}>
                เข้าสู่ห้องแชทกับแพทย์ (Real-time Chat)
              </a>
            </li>
            <li>ดูประวัติการจองและอาการเบื้องต้น</li>
          </ul>
        </>
      )}
      {role === "doctor" && (
        <>
          <h3>ฟังก์ชันสำหรับแพทย์:</h3>
          <ul>
            <li>
              <a href="#" style={{ color: "#337ab7" }}>
                ดูรายการคิวนัดวันนี้ทั้งหมด
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "#337ab7" }}>
                เข้าสู่ Dashboard แชท (ตอบคำถามคนไข้)
              </a>
            </li>
            <li>จัดการเวลาว่างและโปรไฟล์</li>
          </ul>
        </>
      )}
      {role === "admin" && (
        <>
          <h3>ฟังก์ชันสำหรับผู้ดูแลระบบ:</h3>
          <ul>
            <li>
              <a href="#" style={{ color: "#d9534f" }}>
                อนุมัติ/จัดการบัญชีแพทย์
              </a>
            </li>
            <li>ดูสถิติการใช้งานและปริมาณคิวรวม</li>
            <li>จัดการข้อมูลหลักของระบบ (Master Data)</li>
          </ul>
        </>
      )}
    </div>

    <p
      style={{
        marginTop: "20px",
        borderTop: "1px solid #ccc",
        paddingTop: "10px",
      }}
    >
      *ในหน้านี้
      คุณจะสามารถเห็นเฉพาะฟังก์ชันที่เกี่ยวข้องกับบทบาทของคุณเท่านั้น*
    </p>
    <button
      onClick={logout}
      style={{
        marginTop: "20px",
        padding: "10px 20px",
        cursor: "pointer",
        backgroundColor: "#333",
        color: "white",
        border: "none",
        borderRadius: "5px",
      }}
    >
      ออกจากระบบ ({role.toUpperCase()})
    </button>
  </div>
);

export const PatientDashboard = (props) => (
  <DashboardCard {...props} title="หน้าหลักสำหรับคนไข้" role="patient" />
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

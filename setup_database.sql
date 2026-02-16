-- สร้างฐานข้อมูลใหม่ (หรือจะใช้ของเดิมก็ได้)
CREATE DATABASE StartCareDB;
GO

USE StartCareDB;
GO

-- ตาราง Users (เก็บคนไข้และแอดมิน)
CREATE TABLE Users (
    id NVARCHAR(50) PRIMARY KEY, -- ใช้เป็น UID หรือ Username
    password NVARCHAR(255), -- เก็บ Password (ควรเข้ารหัส)
    role NVARCHAR(20) NOT NULL, -- 'patient', 'admin'
    displayName NVARCHAR(100),
    email NVARCHAR(100),
    
    -- ข้อมูลส่วนตัวทั่วไป
    gender NVARCHAR(20),
    dob DATE,
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    province NVARCHAR(100),
    district NVARCHAR(100),
    subDistrict NVARCHAR(100),
    medicalHistory NVARCHAR(MAX)
);
GO

-- ตาราง Appointments (การนัดหมาย)
CREATE TABLE Appointments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    patientId NVARCHAR(50) FOREIGN KEY REFERENCES Users(id),
    date DATE,
    time NVARCHAR(10), -- เช่น '09:00'
    status NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    type NVARCHAR(20), -- 'instant', 'advance'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO

-- ตาราง Notifications (การแจ้งเตือน)
CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(50) FOREIGN KEY REFERENCES Users(id),
    title NVARCHAR(200),
    description NVARCHAR(MAX),
    isRead BIT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO

-- เพิ่มข้อมูลตัวอย่าง (Admin)
INSERT INTO Users (id, password, role, displayName, email)
VALUES ('admin1', '1234', 'admin', 'Admin User', 'admin@example.com');
GO

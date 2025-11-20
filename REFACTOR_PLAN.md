# React Project Refactor Execution Plan

**Project**: Hospital/Medical Appointment System
**Start Date**: 2025-11-20
**Focus**: Component breakdown, custom hooks, code organization
**Methodology**: Incremental refactoring

---

## Overview

จากการวิเคราะห์พบว่า:
- **Total Files**: 55 files
- **Total Lines**: 6,065 lines
- **Problem Files**: 3 files ที่ใหญ่เกินไป (>300 lines)
  - Dashboards.jsx: 606 lines ⚠️
  - BookingPage.jsx: 342 lines ⚠️
  - AuthPage.jsx: 237 lines ⚠️

**เป้าหมาย**: แยกไฟล์ใหญ่ให้เล็กลง, extract reusable logic เป็น custom hooks

---

## Sprint 1: Critical Large Files (Week 1)

**Focus**: แก้ปัญหาไฟล์ที่ใหญ่ที่สุด

### Batch 1.1: Dashboards.jsx (606 lines → ~150 lines each)

- [ ] **อ่านและวิเคราะห์ Dashboards.jsx**
  - เข้าใจโครงสร้างปัจจุบัน
  - ระบุส่วนของ Admin, Doctor, Patient

- [ ] **สร้าง AdminDashboard.jsx**
  - Create `src/components/dashboards/AdminDashboard.jsx`
  - ย้าย admin logic ไปที่นี่
  - Test ว่า admin dashboard ทำงานถูกต้อง

- [ ] **สร้าง DoctorDashboard.jsx**
  - Create `src/components/dashboards/DoctorDashboard.jsx`
  - ย้าย doctor logic ไปที่นี่
  - Test ว่า doctor dashboard ทำงานถูกต้อง

- [ ] **สร้าง PatientDashboard.jsx**
  - Create `src/components/dashboards/PatientDashboard.jsx`
  - ย้าย patient logic ไปที่นี่
  - Test ว่า patient dashboard ทำงานถูกต้อง

- [ ] **Refactor Dashboards.jsx เป็น router**
  - เหลือแค่ role-based routing logic
  - Import 3 dashboards ที่แยกแล้ว
  - Test ทุก role ว่าทำงานได้

- [ ] **Commit**
  ```bash
  git add .
  git commit -m "refactor: split Dashboards.jsx into AdminDashboard, DoctorDashboard, PatientDashboard (606→~150 lines each)"
  ```

**Expected Result**: Dashboards.jsx 606 lines → ~50 lines (router only)

---

### Batch 1.2: BookingPage.jsx (342 lines → ~100 lines each)

- [ ] **อ่านและวิเคราะห์ BookingPage.jsx**
  - เข้าใจ booking flow
  - ระบุส่วนต่างๆ: Doctor selection, Time slot, Form

- [ ] **สร้าง DoctorSelector.jsx**
  - Create `src/components/booking/DoctorSelector.jsx`
  - ย้าย doctor selection UI และ logic
  - รับ props: doctors, selectedDoctor, onSelectDoctor
  - Test การเลือกหหมอ

- [ ] **สร้าง TimeSlotPicker.jsx**
  - Create `src/components/booking/TimeSlotPicker.jsx`
  - ย้าย time slot selection UI และ logic
  - รับ props: availableSlots, selectedSlot, onSelectSlot
  - Test การเลือกเวลา

- [ ] **สร้าง BookingFormFields.jsx**
  - Create `src/components/booking/BookingFormFields.jsx`
  - ย้าย form fields (reason, notes, etc.)
  - รับ props ที่จำเป็น
  - Test form validation

- [ ] **Refactor BookingPage.jsx**
  - ใช้ 3 components ที่แยกแล้ว
  - เหลือแค่ orchestration logic
  - Test ทั้ง booking flow

- [ ] **Commit**
  ```bash
  git commit -m "refactor: split BookingPage into DoctorSelector, TimeSlotPicker, BookingFormFields (342→~100 lines)"
  ```

**Expected Result**: BookingPage.jsx 342 lines → ~100 lines

---

### Batch 1.3: AuthPage.jsx (237 lines → ~120 lines each)

- [ ] **อ่านและวิเคราะห์ AuthPage.jsx**
  - แยก login vs register logic

- [ ] **สร้าง LoginForm.jsx**
  - Create `src/components/auth/LoginForm.jsx`
  - ย้าย login UI และ logic
  - รับ props: onLogin, onSwitchToRegister
  - Test login flow

- [ ] **สร้าง RegisterForm.jsx**
  - Create `src/components/auth/RegisterForm.jsx`
  - ย้าย register UI และ logic
  - รับ props: onRegister, onSwitchToLogin
  - Test registration flow

- [ ] **Refactor AuthPage.jsx**
  - ใช้ LoginForm และ RegisterForm
  - เหลือแค่ state management และ switching logic
  - Test ทั้ง login และ register

- [ ] **Commit**
  ```bash
  git commit -m "refactor: split AuthPage into LoginForm and RegisterForm (237→~120 lines each)"
  ```

**Expected Result**: AuthPage.jsx 237 lines → ~80 lines

---

## Sprint 2: Extract Custom Hooks (Week 2)

**Focus**: ย้าย business logic ออกจาก components เป็น reusable hooks

### Batch 2.1: Auth & Firebase Hooks

- [ ] **Improve useAuth.js**
  - Review current implementation
  - เพิ่ม error handling
  - เพิ่ม loading states
  - Add JSDoc comments

- [ ] **สร้าง useFirestore.js**
  - Create `src/hooks/useFirestore.js`
  - Extract common Firestore operations
  - CRUD operations: add, update, delete, get
  - Real-time listening

- [ ] **สร้าง useAppointments.js**
  - Create `src/hooks/useAppointments.js`
  - Extract appointment logic จาก pages
  - Methods: book, cancel, update status
  - Real-time appointment updates

- [ ] **Commit**
  ```bash
  git commit -m "feat: add useFirestore and useAppointments hooks"
  ```

---

### Batch 2.2: Chat Hooks

- [ ] **สร้าง useChat.js**
  - Create `src/hooks/useChat.js`
  - Extract chat logic จาก ChatWindow, ChatSidebar
  - Methods: sendMessage, loadMessages, loadConversations
  - Real-time message updates

- [ ] **Refactor Chat Components ให้ใช้ useChat**
  - Update ChatWindow.jsx
  - Update ChatSidebar.jsx
  - Update ChatMessages.jsx
  - ลด logic ใน components

- [ ] **Commit**
  ```bash
  git commit -m "refactor: extract chat logic to useChat hook"
  ```

---

### Batch 2.3: Doctor & Patient Management Hooks

- [ ] **สร้าง useDoctors.js**
  - Create `src/hooks/useDoctors.js`
  - Extract doctor management logic
  - Methods: getDoctors, addDoctor, updateDoctor, deleteDoctor

- [ ] **สร้าง usePatients.js**
  - Create `src/hooks/usePatients.js`
  - Extract patient management logic
  - Methods: getPatients, addPatient, updatePatient, deletePatient

- [ ] **สร้าง useQueue.js**
  - Create `src/hooks/useQueue.js`
  - Extract queue management logic
  - Real-time queue updates

- [ ] **Refactor management pages**
  - Update DoctorManagementPage.jsx ใช้ useDoctors
  - Update PatientManagementPage.jsx ใช้ usePatients
  - Update QueuePage.jsx ใช้ useQueue

- [ ] **Commit**
  ```bash
  git commit -m "refactor: extract management logic to custom hooks"
  ```

---

## Sprint 3: Medium Components (Week 3)

**Focus**: ปรับปรุง medium complexity components

### Batch 3.1: Complex UI Components

- [ ] **Review dropdown-menu.jsx (169 lines)**
  - ดูว่ามีส่วนไหนแยกได้ไหม
  - ถ้าเป็น shadcn/ui component ปล่อยไว้ก่อน

- [ ] **Review dialog.jsx (103 lines)**
  - ดูว่ามีส่วนไหนแยกได้ไหม

- [ ] **Review PatientCard.jsx (155 lines)**
  - แยก PatientInfo section
  - แยก PatientActions section
  - สร้าง sub-components ถ้าจำเป็น

---

### Batch 3.2: Modal Components

- [ ] **Review MedicalHistoryModal.jsx (107 lines)**
  - แยก MedicalHistoryForm
  - แยก MedicalHistoryDisplay

- [ ] **Review ViewMedicalHistoryModal.jsx (127 lines)**
  - แยก history items list
  - แยก individual history item card

- [ ] **Commit**
  ```bash
  git commit -m "refactor: improve modal components structure"
  ```

---

### Batch 3.3: Chat Components Optimization

- [ ] **Optimize ChatMessages.jsx (155 lines)**
  - Add React.memo
  - Optimize message rendering
  - Virtual scrolling ถ้าจำเป็น

- [ ] **Optimize ChatWindow.jsx (212 lines)**
  - ใช้ useCallback สำหรับ event handlers
  - ลด re-renders

- [ ] **Optimize ChatSidebar.jsx (215 lines)**
  - Add React.memo สำหรับ conversation items
  - ลด re-renders

- [ ] **Commit**
  ```bash
  git commit -m "perf: optimize chat components rendering"
  ```

---

## Sprint 4: Code Organization & Polish (Week 4)

**Focus**: จัดระเบียบ code structure

### Batch 4.1: Folder Structure Improvement

- [ ] **จัดระเบียบ components/common**
  - Group related components
  - Create sub-folders ถ้าจำเป็น
  - Update imports

- [ ] **จัดระเบียบ pages**
  - Ensure consistent structure
  - Group by user role ถ้าจำเป็น

- [ ] **Create barrel exports (index.js)**
  - Add index.js ใน folders ที่สำคัญ
  - Export components เพื่อ simplify imports

---

### Batch 4.2: Performance Optimization

- [ ] **Add React.memo to pure components**
  - Identify components ที่ควร memo
  - Wrap with React.memo
  - Test performance

- [ ] **Optimize hooks with useMemo/useCallback**
  - Review expensive computations
  - Add useMemo where needed
  - Add useCallback for stable function references

- [ ] **Optimize Firebase queries**
  - Review all Firestore queries
  - Add proper where clauses
  - Implement pagination
  - Add indexes ใน firestore.indexes.json

- [ ] **Commit**
  ```bash
  git commit -m "perf: add memoization and optimize Firebase queries"
  ```

---

### Batch 4.3: Code Cleanup

- [ ] **Remove unused code**
  - Remove commented code
  - Remove unused imports
  - Remove unused variables

- [ ] **Consistent naming**
  - Review component naming
  - Review function naming
  - Review variable naming

- [ ] **Add PropTypes**
  ```bash
  npm install prop-types
  ```
  - Add PropTypes to main components
  - Document expected props

- [ ] **Commit**
  ```bash
  git commit -m "refactor: code cleanup and add PropTypes"
  ```

---

### Batch 4.4: Documentation

- [ ] **Add JSDoc comments**
  - Document all custom hooks
  - Document complex components
  - Document utility functions

- [ ] **Update README.md**
  - Document new folder structure
  - Add component hierarchy
  - Add setup instructions

- [ ] **Create ARCHITECTURE.md**
  - Document component architecture
  - Document data flow
  - Document Firebase structure

- [ ] **Commit**
  ```bash
  git commit -m "docs: add comprehensive documentation"
  ```

---

## Progress Tracking

### Sprint Status

| Sprint | Focus | Files | Status | Progress |
|--------|-------|-------|--------|----------|
| Sprint 1 | Large Files | 3 | ⏳ Pending | 0/3 |
| Sprint 2 | Custom Hooks | ~8 | ⏳ Pending | 0/8 |
| Sprint 3 | Medium Components | ~10 | ⏳ Pending | 0/10 |
| Sprint 4 | Organization & Polish | All | ⏳ Pending | 0% |

### Key Metrics

| Metric | Before | Target | Current | Status |
|--------|--------|--------|---------|--------|
| Largest File | 606 lines | <200 lines | 606 | 🔴 |
| Files >300 lines | 3 | 0 | 3 | 🔴 |
| Files >200 lines | 6 | <3 | 6 | 🔴 |
| Custom Hooks | 1 | 8+ | 1 | 🔴 |
| Circular Deps | 0 | 0 | 0 | 🟢 |

---

## Execution Rules

### Per Batch (3-5 files)
1. อ่านและเข้าใจ code เดิม
2. Plan refactoring approach
3. Refactor ทีละ component
4. Test manual หลัง refactor แต่ละตัว
5. Test ทั้ง flow เมื่อเสร็จ batch
6. Commit

### Git Strategy
```bash
# Before each sprint
git checkout -b sprint-N-refactor

# After each batch
git add .
git commit -m "descriptive message"

# ถ้ามีปัญหา
git stash
git log
git checkout [last-good-commit]
```

### Testing Checklist (Manual)
- [ ] npm run dev ทำงานได้
- [ ] ไม่มี console errors
- [ ] User flow ที่เกี่ยวข้องทำงานถูกต้อง
- [ ] UI แสดงผลเหมือนเดิม

---

## Critical Files (Extra Care)

ไฟล์เหล่านี้ต้องระวังพิเศษ:
1. **Dashboards.jsx** - Core routing
2. **BookingPage.jsx** - Revenue critical
3. **AuthPage.jsx** - Security
4. **firebase.js** - Database connection
5. **hooks/useAuth.js** - Authentication

---

## Commit Message Format

```bash
# Pattern
<type>: <clear description>

# Types
refactor: - Refactoring code
feat:     - New feature
fix:      - Bug fix
perf:     - Performance improvement
docs:     - Documentation

# Examples
git commit -m "refactor: split Dashboards into role-based components"
git commit -m "feat: add useAppointments hook"
git commit -m "perf: add React.memo to chat components"
```

---

## Ready to Start! 🚀

**Next Action**: เริ่ม Sprint 1, Batch 1.1 - Refactor Dashboards.jsx

คุณพร้อมให้เริ่มต้นได้เลยไหมครับ?

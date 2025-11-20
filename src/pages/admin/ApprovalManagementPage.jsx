import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { FaUserMd, FaUserTie, FaCheck, FaTimes, FaUser, FaClock } from 'react-icons/fa';
import './ManagementPage.css';

const ApprovalManagementPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    // ดึงรายการที่รอการอนุมัติ
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("accountStatus", "==", "pending"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingRequests(requests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId, requestedRole) => {
    setProcessing(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: requestedRole,
        accountStatus: 'approved',
        requestedRole: null,
        approvedAt: new Date()
      });
      alert('อนุมัติสำเร็จ!');
    } catch (error) {
      console.error("Error approving user:", error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอนี้?')) return;

    setProcessing(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        accountStatus: 'rejected',
        rejectedAt: new Date()
      });
      alert('ปฏิเสธคำขอแล้ว');
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setProcessing(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <FaUserMd size={24} color="#28a745" />;
      case 'admin':
        return <FaUserTie size={24} color="#e6b800" />;
      default:
        return <FaUser size={24} color="#668ee0" />;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'doctor':
        return 'แพทย์';
      case 'admin':
        return 'แอดมิน';
      default:
        return 'คนไข้';
    }
  };

  if (loading) {
    return <div className="management-loading">กำลังโหลด...</div>;
  }

  return (
    <div className="management-page">
      <div className="management-header">
        <h2>
          <FaClock size={24} style={{ marginRight: '10px' }} />
          คำขออนุมัติบัญชี
        </h2>
        <p className="management-subtitle">
          จัดการคำขอสมัครเป็นแพทย์หรือแอดมิน
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="management-empty">
          <FaCheck size={48} color="#28a745" />
          <p>ไม่มีคำขอที่รอการอนุมัติ</p>
        </div>
      ) : (
        <div className="management-grid">
          {pendingRequests.map((request) => (
            <div key={request.id} className="approval-card">
              <div className="approval-card-header">
                <div className="approval-icon">
                  {getRoleIcon(request.requestedRole)}
                </div>
                <div className="approval-info">
                  <h3>{request.displayName || 'ไม่ระบุชื่อ'}</h3>
                  <p className="approval-email">{request.email}</p>
                </div>
              </div>

              <div className="approval-details">
                <div className="approval-detail-row">
                  <span className="detail-label">ต้องการเป็น:</span>
                  <span className="detail-value role-badge" style={{
                    backgroundColor: request.requestedRole === 'doctor' ? '#28a74520' : '#e6b80020',
                    color: request.requestedRole === 'doctor' ? '#28a745' : '#e6b800'
                  }}>
                    {getRoleText(request.requestedRole)}
                  </span>
                </div>
                <div className="approval-detail-row">
                  <span className="detail-label">สมัครเมื่อ:</span>
                  <span className="detail-value">
                    {request.createdAt?.toDate ?
                      new Date(request.createdAt.toDate()).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) :
                      'ไม่ทราบวันที่'
                    }
                  </span>
                </div>
                <div className="approval-detail-row">
                  <span className="detail-label">สถานะปัจจุบัน:</span>
                  <span className="detail-value">
                    {getRoleText(request.role)} (ชั่วคราว)
                  </span>
                </div>
              </div>

              <div className="approval-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(request.id, request.requestedRole)}
                  disabled={processing === request.id}
                >
                  <FaCheck size={16} />
                  {processing === request.id ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                >
                  <FaTimes size={16} />
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalManagementPage;

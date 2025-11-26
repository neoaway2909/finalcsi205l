import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaCalendarAlt } from "react-icons/fa";
import { LoadingSkeletonRow, EmptyState } from "../components/CommonComponents";

const AllAppointmentsPage = ({ lang }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const appointmentsCol = collection(db, "appointments");
    const q = query(appointmentsCol); // No filter, get all appointments

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const appointmentsList = await Promise.all(
          snapshot.docs.map(async (appointmentDoc) => {
            const appointmentData = appointmentDoc.data();

            // Fetch patient details
            const patientDocRef = doc(db, "users", appointmentData.patientId);
            const patientDoc = await getDoc(patientDocRef);
            const patientName = patientDoc.exists()
              ? patientDoc.data().displayName || "Unknown Patient"
              : "Unknown Patient";

            // Fetch doctor details
            const doctorDocRef = doc(db, "users", appointmentData.doctorId);
            const doctorDoc = await getDoc(doctorDocRef);
            const doctorName = doctorDoc.exists()
              ? doctorDoc.data().displayName || "Unknown Doctor"
              : "Unknown Doctor";

            return {
              id: appointmentDoc.id,
              patientName,
              doctorName,
              date: appointmentData.date,
              time: appointmentData.time,
              status: appointmentData.status,
            };
          })
        );
        setAppointments(appointmentsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching all appointments: ", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusChip = (status) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    switch (status) {
      case "confirmed":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "completed":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "cancelled":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
    }
    return `px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor}`;
  };


  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.75rem', color: '#1a1a1a', marginBottom: '2rem' }}>
        <FaCalendarAlt /> All Appointments
      </h2>

      <table
        style={{
          width: "100%",
          background: "var(--md-surface)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "var(--elevation-2)",
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#f8faff" }}>
          <tr>
            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e8f0fe" }}>
              Patient
            </th>
            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e8f0fe" }}>
              Doctor
            </th>
            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e8f0fe" }}>
              Date
            </th>
            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e8f0fe" }}>
              Time
            </th>
            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#333", borderBottom: "2px solid #e8f0fe" }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeletonRow cols={5} />
          ) : appointments.length === 0 ? (
            <tr>
              <td colSpan="5">
                <EmptyState
                  message="No appointments found"
                  icon={<FaCalendarAlt size={48} />}
                />
              </td>
            </tr>
          ) : (
            appointments.map((app) => (
              <tr key={app.id} style={{ borderBottom: "1px solid #f0f4ff" }}>
                <td style={{ padding: "1rem" }}>{app.patientName}</td>
                <td style={{ padding: "1rem" }}>{app.doctorName}</td>
                <td style={{ padding: "1rem" }}>{new Date(app.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                <td style={{ padding: "1rem" }}>{app.time}</td>
                <td style={{ padding: "1rem" }}>
                  <span className={getStatusChip(app.status)}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllAppointmentsPage;

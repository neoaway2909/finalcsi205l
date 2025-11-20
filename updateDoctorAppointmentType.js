/**
 * Migration Script: Update Doctor Appointment Types
 *
 * This script updates all doctors in Firestore to have an appointmentType field.
 * You can customize which doctors get which type.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

// Your Firebase config (copy from src/firebase.js)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Update all doctors with appointmentType
 */
async function updateDoctorAppointmentTypes() {
  try {
    console.log("🔍 Fetching all doctors...");

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "doctor"));
    const querySnapshot = await getDocs(q);

    console.log(`✅ Found ${querySnapshot.size} doctors\n`);

    if (querySnapshot.size === 0) {
      console.log("⚠️  No doctors found in the database.");
      return;
    }

    // Update each doctor
    for (const docSnap of querySnapshot.docs) {
      const doctorData = docSnap.data();
      const doctorName = doctorData.displayName || doctorData.email || docSnap.id;

      // Check if appointmentType already exists
      if (doctorData.appointmentType) {
        console.log(`⏭️  Skipping ${doctorName} (already has appointmentType: ${doctorData.appointmentType})`);
        continue;
      }

      // Default: Set all doctors to "both" (can customize logic here)
      let appointmentType = "both";

      // Example: Customize based on specialty
      // if (doctorData.specialty === "Emergency Medicine") {
      //   appointmentType = "instant";
      // } else if (doctorData.specialty === "Surgery") {
      //   appointmentType = "advance";
      // }

      // Update the doctor document
      const doctorRef = doc(db, "users", docSnap.id);
      await updateDoc(doctorRef, {
        appointmentType: appointmentType
      });

      console.log(`✅ Updated ${doctorName} → appointmentType: "${appointmentType}"`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`   - Total doctors updated: ${querySnapshot.size}`);
    console.log(`   - Default appointmentType: "both"`);
    console.log("\n💡 Tip: You can manually change appointmentType in Firestore Console if needed.");

  } catch (error) {
    console.error("❌ Error updating doctors:", error);
  }
}

// Run the migration
updateDoctorAppointmentTypes();

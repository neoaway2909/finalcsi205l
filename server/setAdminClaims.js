// setAdminClaims.mjs
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// กำหนดค่า Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// UID ของผู้ใช้ที่จะตั้งเป็น Admin
const uidOfAdmin = 'UID ของ Admin ที่คุณต้องการตั้ง';

// ฟังก์ชัน async เพื่อเรียก setCustomUserClaims
async function setAdmin() {
  try {
    await admin.auth().setCustomUserClaims(uidOfAdmin, { role: 'admin' });
    console.log('Admin claims set successfully!');
  } catch (error) {
    console.error('Error setting admin claims:', error);
  }
}

// เรียกใช้ฟังก์ชัน
setAdmin();

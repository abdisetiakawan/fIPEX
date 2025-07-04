const admin = require("firebase-admin");

// Load service account JSON dari file
const serviceAccount = require("./firebase-secret.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: "your-project-id.appspot.com", // ganti sesuai project
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
(async () => {
  try {
    const testRef = db.collection("test").doc("ping");
    await testRef.set({ time: new Date().toISOString() });
    const snap = await testRef.get();
    console.log("Data:", snap.data());
  } catch (error) {
    console.error(error);
  }
})();

module.exports = { admin, db, auth, storage };

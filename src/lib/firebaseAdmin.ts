import admin from "firebase-admin";

const serviceAccount = require("../path/to/serviceAccountKey.json"); // Ensure correct path

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();

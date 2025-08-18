import admin from "firebase-admin";
import serviceAccount from "../config/firebaseServiceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

/**
 * Verifies a Firebase ID token and returns the decoded token data
 * @param {string} idToken - The Firebase authentication token
 * @returns {Promise<object>} - Decoded token with user info
 */
export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken; // { uid, email, name, picture, ... }
  } catch (error) {
    throw new Error("Invalid Firebase token");
  }
};

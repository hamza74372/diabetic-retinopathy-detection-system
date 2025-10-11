// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // <-- 1. ADD THIS IMPORT
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm9AQcn2U5WDYD7_DTauV9jxK_IpQ_zcQ",
  authDomain: "dr-detection-system.firebaseapp.com",
  projectId: "dr-detection-system",
  storageBucket: "dr-detection-system.firebasestorage.app",
  messagingSenderId: "159862176833",
  appId: "1:159862176833:web:5c778e86a42d623f111ac0",
  measurementId: "G-XDTN10SSJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. CREATE AND EXPORT THE AUTH SERVICE
// This is the line that makes 'auth' available for import in other files.
export const db = getDatabase(app);
export const auth = getAuth(app);
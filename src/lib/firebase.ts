import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqfpKSoiSzrc1G3XNY-lqCdMao49x5Kwg",
  authDomain: "hiba-32979.firebaseapp.com",
  projectId: "hiba-32979",
  storageBucket: "hiba-32979.firebasestorage.app",
  messagingSenderId: "859885765410",
  appId: "1:859885765410:web:353878faf8312501695b7b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
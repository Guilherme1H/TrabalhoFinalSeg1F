import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCK49ZdBT80lWKgxm1NFAJU4DYTL9ok9sY",
  authDomain: "projetofinal-13fb1.firebaseapp.com",
  projectId: "projetofinal-13fb1",
  storageBucket: "projetofinal-13fb1.firebasestorage.app",
  messagingSenderId: "674298373854",
  appId: "1:674298373854:web:ab23739ec530f8d3c7c44f",
  measurementId: "G-PG0D31CQGC",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

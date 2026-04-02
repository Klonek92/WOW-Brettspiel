import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCc9HzvrsPtKSmnH_ju7l86ZqpTuOD6S58",
  authDomain: "wow-board-30c19.firebaseapp.com",
  projectId: "wow-board-30c19",
  storageBucket: "wow-board-30c19.firebasestorage.app",
  messagingSenderId: "758282794493",
  appId: "1:758282794493:web:959a8bdf443546418c1594",
  measurementId: "G-S9DP9DH867"
};

// 1. Initialisieren
const app = initializeApp(firebaseConfig);

// 2. Exportieren (Ganz wichtig!)
export const db = getFirestore(app);
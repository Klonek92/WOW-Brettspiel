// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCc9HzvrsPtKSmnH_ju7l86ZqpTuOD6S58",
  authDomain: "wow-board-30c19.firebaseapp.com",
  projectId: "wow-board-30c19",
  storageBucket: "wow-board-30c19.firebasestorage.app",
  messagingSenderId: "758282794493",
  appId: "1:758282794493:web:959a8bdf443546418c1594",
  measurementId: "G-S9DP9DH867"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
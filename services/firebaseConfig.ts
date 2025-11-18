
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYm7yx16yxkzw2q9ywAMgptP4pRlFp3qY",
  authDomain: "calculadora-d4809.firebaseapp.com",
  projectId: "calculadora-d4809",
  storageBucket: "calculadora-d4809.appspot.com",
  messagingSenderId: "523735280269",
  appId: "1:523735280269:web:ba196d97667547668fd0c4",
  measurementId: "G-E62MVL7JYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

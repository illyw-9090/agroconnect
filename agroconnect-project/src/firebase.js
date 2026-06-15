// Konfigurasi dan inisialisasi Firebase untuk AgroConnect
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOC6UMomef2pHM5a9hrXiw_R2yX8krKKs",
  authDomain: "agrocennect-5e68c.firebaseapp.com",
  projectId: "agrocennect-5e68c",
  storageBucket: "agrocennect-5e68c.firebasestorage.app",
  messagingSenderId: "904007581427",
  appId: "1:904007581427:web:470cb235ea9060bca6c186",
  measurementId: "G-CNRR3YV93S",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

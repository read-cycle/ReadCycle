import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD5RDA1rBtH-NXnY1Uhw6MRptogbOZvXNM",
  authDomain: "book-exchange-22dd2.firebaseapp.com",
  projectId: "book-exchange-22dd2",
  storageBucket: "book-exchange-22dd2.appspot.com",
  messagingSenderId: "940989241251",
  appId: "1:940989241251:web:bce3d53cd7fe5de347ec16",
  measurementId: "G-G8TPSVZSDB"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage };
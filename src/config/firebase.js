// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  //real database
  //  apiKey: "AIzaSyA5SEx6I4KC4rxkmtc-aBYbTpeDl47vGGQ",
  // authDomain: "inner-bliss-65eb3.firebaseapp.com",
  // projectId: "inner-bliss-65eb3",
  // storageBucket: "inner-bliss-65eb3.appspot.com",
  // messagingSenderId: "295829093418",
  // appId: "1:295829093418:web:b3b6126766440e7f419753",
  // measurementId: "G-H3EK4HEH14"
  // test database
   apiKey: "AIzaSyAaEPKP25aaDZ79FDq9gej6ZOIeL8UryyA",
  authDomain: "marketplace-731ab.firebaseapp.com",
  projectId: "marketplace-731ab",
  storageBucket: "marketplace-731ab.firebasestorage.app",
  messagingSenderId: "1097443515337",
  appId: "1:1097443515337:web:76a42e6ce53888b53b6618",
  measurementId: "G-XZ50CL859M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app)
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBUkI5ks9lEFuqejngEBD4NY-DDRAWeef0",
    authDomain: "scrapy-1281d.firebaseapp.com",
    projectId: "scrapy-1281d",
    storageBucket: "scrapy-1281d.appspot.com",
    messagingSenderId: "181430452933",
    appId: "1:181430452933:web:4fe52c56399359fee126ac",
    measurementId: "G-MX1MMW28KP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getFirestore(app);

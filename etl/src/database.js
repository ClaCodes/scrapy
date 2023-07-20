import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBUkI5ks9lEFuqejngEBD4NY-DDRAWeef0",
    authDomain: "scrapy-1281d.firebaseapp.com",
    projectId: "scrapy-1281d",
    storageBucket: "scrapy-1281d.appspot.com",
    messagingSenderId: "181430452933",
    appId: "1:181430452933:web:4fe52c56399359fee126ac",
    measurementId: "G-MX1MMW28KP"
};

const app = initializeApp(firebaseConfig);

export const database = getFirestore(app);

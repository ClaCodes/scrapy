import {initializeApp} from "firebase/app";
import {collection, doc, getDocs, getFirestore, writeBatch} from "firebase/firestore";

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

/** @type {Firestore} */
export const database = getFirestore(app);
export const SCHWINGER_COLLECTION = "schwinger";

/**
 * Loads a list of Schwinger into the database using a batch write.
 * Since batch writes are limited to 500 operations, the Schwinger are split into chunks of 500.
 *
 * @param {Schwinger[]} data
 */
export async function storeSchwinger(data) {
    const chunkSize = 500;
    /** @type {Schwinger[][]} */
    const chunks = [];
    for (let i = 0; i < dataToBeUploaded.length; i += chunkSize) {
        chunks.push(dataToBeUploaded.slice(i, i + chunkSize));
    }
    console.log(`Split the Schwinger into ${chunks.length} chunks of size ${chunkSize} Schwinger each`);

    let chunkCounter = 1;
    for (const chunk of chunks) {
        const batch = writeBatch(database);
        for (const schwinger of chunk) {
            const schwingerRef = doc(database, SCHWINGER_COLLECTION, String(schwinger.id));
            batch.set(schwingerRef, schwinger);
        }
        await batch.commit();
        console.log(`Uploaded chunk ${chunkCounter++} of ${chunks.length}`);
    }

    console.log(`Successfully uploaded ${dataToBeUploaded.length} Schwinger to the database`);
}

/**
 * Loads all Schwinger from the database.
 *
 * @returns {Promise<Schwinger[]>}
 */
export async function loadSchwinger() {
    const schwingerSnapshot = await getDocs(collection(db, SCHWINGER_COLLECTION));
    const allSchwinger = []
    schwingerSnapshot.forEach((schwinger) => {
        allSchwinger.push(schwinger.data());
    });
    return allSchwinger;
}

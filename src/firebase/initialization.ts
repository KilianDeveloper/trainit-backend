import { cert, initializeApp } from 'firebase-admin/app';
import * as path from 'path';
export const initializeFirebase = () => {
    initializeApp({
        credential: cert(path.join(__dirname, '../certificates/firebase_config.json')),
        databaseURL: "https://trainIt.firebaseio.com",
    })
}
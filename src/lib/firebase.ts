import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyACyCxb_Yp8k-XBU0p0T49tUmh8yfLmY7k",
  authDomain: "dnd-manage.firebaseapp.com",
  projectId: "dnd-manage",
  storageBucket: "dnd-manage.appspot.com",
  messagingSenderId: "494680462269",
  appId: "1:494680462269:web:717fa322c37ba74785f8d4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
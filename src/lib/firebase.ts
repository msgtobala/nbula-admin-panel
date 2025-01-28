import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA4PrlUmImawoYQVcG5VUyK8ScvsRr2OzI",
  authDomain: "nbula-admin-panel.firebaseapp.com",
  projectId: "nbula-admin-panel",
  storageBucket: "nbula-admin-panel.firebasestorage.app",
  messagingSenderId: "803570008370",
  appId: "1:803570008370:web:568d196ccd8a0add44d72b",
  measurementId: "G-7X12RPKSQ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const fetchSkills = async () => {
  const skillsRef = collection(db, 'skills');
  const q = query(skillsRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    value: doc.data().name,
    label: doc.data().name,
  }));
};

export const addSkill = async (skillName: string) => {
  const skillsRef = collection(db, 'skills');
  await addDoc(skillsRef, {
    name: skillName,
    createdAt: new Date(),
  });
};
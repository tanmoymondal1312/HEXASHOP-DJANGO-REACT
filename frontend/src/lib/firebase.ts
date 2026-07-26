import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBCGrw6zvZbHMAdMNPVYyAj_Jyca3Zbn9U",
  authDomain: "hexashop-74b66.firebaseapp.com",
  projectId: "hexashop-74b66",
  storageBucket: "hexashop-74b66.firebasestorage.app",
  messagingSenderId: "458005636166",
  appId: "1:458005636166:web:e027b8e38ec7ae3d509647",
  measurementId: "G-7ZPB36NDEZ",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export { auth, googleProvider };

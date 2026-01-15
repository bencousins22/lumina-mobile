
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
}

export async function signUp(email: string, password: string): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
  };
  // Create a user document in Firestore
  await setDoc(doc(db, 'users', user.uid), userProfile);
  return userProfile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  } else {
    // This case should ideally not happen if signUp creates the user doc
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile
  }
}

export async function logOut(): Promise<void> {
  return await signOut(auth);
}

export function onAuthChange(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback(userDoc.data() as UserProfile);
      } else {
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
        callback(userProfile)
      }
    } else {
      callback(null);
    }
  });
}

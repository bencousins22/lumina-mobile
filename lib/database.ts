
import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  docData,
} from 'firebase/firestore';

// Generic function to get a collection
export async function getCollection(collectionName: string): Promise<QuerySnapshot<DocumentData>> {
  const collectionRef = collection(db, collectionName);
  return await getDocs(collectionRef);
}

// Generic function to get a document by ID
export async function getDocument(collectionName: string, id: string): Promise<DocumentSnapshot<DocumentData>> {
  const docRef = doc(db, collectionName, id);
  return await getDoc(docRef);
}

// Generic function to add a document to a collection
export async function addDocument(collectionName: string, data: object): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
}

// Generic function to update a document
export async function updateDocument(collectionName: string, id: string, data: object): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// Get realtime updates for a document
export function getDocumentRealtime(collectionName: string, id: string, callback: (data: DocumentData | null) => void) {
    const docRef = doc(db, collectionName, id);
    return docData(docRef, (data) => {
        callback(data)
    });
}

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { PerjalananDinas } from '../types/perjadin';
import { handleFirestoreError, OperationType } from './errorHandler';

const COLLECTION_NAME = 'perjalanan_dinas';

export async function getPerjalananDinasList(): Promise<PerjalananDinas[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const items: PerjalananDinas[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as PerjalananDinas);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export async function savePerjalananDinasDoc(item: PerjalananDinas): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${item.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deletePerjalananDinasDoc(id: string): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function batchSyncToFirestore(items: PerjalananDinas[]): Promise<number> {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
    return items.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

export function subscribeToPerjalananDinas(
  onData: (items: PerjalananDinas[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PerjalananDinas[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PerjalananDinas);
      });
      onData(items);
    },
    (error) => {
      console.warn('Real-time Firestore sync notice:', error.message);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
    DocumentSnapshot,
    Unsubscribe,
    query,
    where,
    getDocs,
  } from 'firebase/firestore';
  import { db } from '../config';
  import type { GeminiConfigDB } from '../types';
  import data from '@/temp';
  
  export interface CreateUserData {
    email: string;
  }
  
  export default class GeminiConfigService {
    static readonly COLLECTION_NAME: string = 'geminiConfigs';
    static readonly DOC_ID: string = 'defaultConfig';
    /**
     * Subscribe to a user's profile document
     */
    static subscribeToGeminiConfig( callback: (geminiConfig: GeminiConfigDB) => void): Unsubscribe {
        
      const geminiConfigRef = doc(collection(db, this.COLLECTION_NAME), this.DOC_ID);
      return onSnapshot(
        geminiConfigRef,
        (snap: DocumentSnapshot) => {
          if (snap.exists()) {
            const data = snap.data() || {};
            callback({...data } as GeminiConfigDB);
          }
        }
      );
    }
}
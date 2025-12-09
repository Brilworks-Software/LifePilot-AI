import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config';
import type { AIConversation, Message } from '../types';
import {sendMessageToGemini} from "@/services/gemini"

type ConversationType = AIConversation['conversationType'];

export interface CreateConversationInput {
  userId: string;
  conversationType: ConversationType;
  initialMessages?: CreateMessageInput[];
}

export interface CreateMessageInput
  extends Omit<Message, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export default class AIConversationService {
  private static readonly COLLECTION = 'ai_conversations';

  /**
   * Create a new conversation document
   */
  static async createConversation(
    input: CreateConversationInput
  ): Promise<AIConversation> {
    const timestamp = serverTimestamp();
    const messages = (input.initialMessages ?? []).map((message) =>
      this.buildMessage(message)
    );

    const payload = {
      userId: input.userId,
      conversationType: input.conversationType,
      messages,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await addDoc(this.collectionRef(), payload);
    return { id: docRef.id, ...payload } as AIConversation;
  }

  /**
   * Fetch a conversation by id
   */
  static async fetchConversation(conversationId: string): Promise<AIConversation> {
    const snap = await getDoc(this.docRef(conversationId));
    if (!snap.exists()) throw new Error('Conversation not found');
    return this.mapSnapshot(snap);
  }

  /**
   * Fetch all conversations for a user with optional type filtering
   */
  static async fetchUserConversations(
    userId: string,
    conversationType?: ConversationType
  ): Promise<AIConversation[]> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    if (conversationType) {
      constraints.push(where('conversationType', '==', conversationType));
    }
    constraints.push(orderBy('updatedAt', 'desc'));

    const conversationsQuery = query(this.collectionRef(), ...constraints);
    const snapshot = await getDocs(conversationsQuery);
    return snapshot.docs.map((docSnap) => this.mapSnapshot(docSnap));
  }

  /**
   * Subscribe to a single conversation document
   */
  static subscribeToConversation(
    conversationId: string,
    callback: (conversation: AIConversation) => void
  ): Unsubscribe {
    return onSnapshot(this.docRef(conversationId), (snap) => {
      if (snap.exists()) {
        callback(this.mapSnapshot(snap));
      }
    });
  }

  /**
   * Subscribe to conversations list for a user
   */
  static subscribeToUserConversations(
    userId: string,
    callback: (conversations: AIConversation[]) => void,
    conversationType?: ConversationType
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    if (conversationType) {
      constraints.push(where('conversationType', '==', conversationType));
    }
    constraints.push(orderBy('updatedAt', 'desc'));

    const conversationsQuery = query(this.collectionRef(), ...constraints);
    return onSnapshot(conversationsQuery, (snapshot) => {
      const conversations = snapshot.docs.map((docSnap) =>
        this.mapSnapshot(docSnap)
      );
      callback(conversations);
    });
  }

  /**
   * Append a message to a conversation
   */
  static async appendMessage(
    conversationId: string,
    messages: Message[]
  ): Promise<void> {
    const conversationRef = this.docRef(conversationId);
    console.log(messages);
    
    await updateDoc(conversationRef, {
      messages: messages,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update metadata (currently only conversationType)
   */
  static async updateConversationType(
    conversationId: string,
    conversationType: ConversationType
  ): Promise<void> {
    await updateDoc(this.docRef(conversationId), {
      conversationType,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Delete a conversation document
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    await deleteDoc(this.docRef(conversationId));
  }

  private static collectionRef() {
    return collection(db, this.COLLECTION);
  }

  private static docRef(conversationId: string) {
    return doc(this.collectionRef(), conversationId);
  }

  private static mapSnapshot(snap: DocumentSnapshot): AIConversation {
    const data = snap.data();
    if (!data) {
      throw new Error('Conversation not found');
    }
    return { id: snap.id, ...data } as AIConversation;
  }

  private static buildMessage(message: CreateMessageInput): Message {
    const timestamp = serverTimestamp();
    return {
      id: message.id ?? this.generateId(),
      text: message.text,
      role: message.role,
      image: message.image,
      timestamp: timestamp,
    };
  }

  private static generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}


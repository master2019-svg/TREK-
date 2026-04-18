import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider with additional scopes
googleProvider.addScopes('profile', 'email');
googleProvider.setCustomParameters({
  'login_hint': 'user@example.com',
  'prompt': 'select_account'
});

export { signInWithPopup, signOut };

// Error handling for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Enhanced error handling for authentication errors
export function getAuthErrorMessage(error: any): string {
  if (error.code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for Google Sign-In. Please add it to Firebase Console > Authentication > Authorized domains.';
  } else if (error.code === 'auth/cancelled-popup-request') {
    return 'Login popup request was cancelled by a newer request.';
  } else if (error.code === 'auth/popup-closed-by-user') {
    return 'Login popup was closed by the user.';
  } else if (error.code === 'auth/operation-not-allowed') {
    return 'Google Sign-In is not enabled. Please enable it in Firebase Console.';
  } else if (error.code === 'auth/network-request-failed') {
    return 'Network error. Please check your connection and try again.';
  } else {
    return error.message || 'An error occurred during authentication.';
  }
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export { serverTimestamp };
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  User,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Configure Google Provider with proper settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const ADMIN_EMAIL = 'mitadruroy006@gmail.com';

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: new Date()
    });
    
    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    await createOrUpdateUserDocument(user);
    
    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Please enable popups for this site to use Google Sign-In');
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`This domain is not authorized. Please ensure you're accessing from ${auth.app.options.authDomain} or localhost:5173`);
    }
    
    if (error.code === 'auth/invalid-oauth-client-id') {
      throw new Error('Invalid OAuth Client ID. Please check your Firebase configuration.');
    }
    
    if (error.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('Google Sign-In is not supported in this environment. Please check your Firebase configuration and authorized domains.');
    }
    
    throw new Error(getErrorMessage(error.code));
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      await createOrUpdateUserDocument(user);
      return user;
    }
    return null;
  } catch (error: any) {
    console.error('Error handling redirect result:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

const createOrUpdateUserDocument = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Failed to log out');
  }
};

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Helper function to get user-friendly error messages - now exported
export const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google Sign-In. Please contact the administrator or use email/password authentication.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/invalid-oauth-client-id':
      return 'Invalid OAuth configuration. Please contact the administrator.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Authentication not supported in this environment. Please check you are using an authorized domain.';
    case 'auth/redirect-cancelled-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/redirect-operation-pending':
      return 'Please wait for the ongoing sign-in operation to complete.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};
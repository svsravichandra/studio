
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    signOut as firebaseSignOut, 
    User, 
    GoogleAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  authInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get a friendlier error message
const getFirebaseAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email address.';
        case 'auth/weak-password':
            return 'The password is too weak. Please use a stronger password.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authInitialized = !!auth;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Cannot sign in: Firebase is not initialized. Please check your .env file.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    if (!auth) {
        throw new Error("Authentication is not available.");
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: name });
        // Manually update user state to reflect display name immediately
        setUser(auth.currentUser); 
        router.push('/dashboard');
    } catch (error) {
        throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) {
        throw new Error("Authentication is not available.");
    }
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/dashboard');
    } catch (error) {
        throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
    }
  }
  
  const signOut = async () => {
    if (!auth) {
      console.error("Cannot sign out: Firebase is not initialized.");
      return;
    }
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, authInitialized };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

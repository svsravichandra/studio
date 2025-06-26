
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
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
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  authInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const createUserProfileDocument = async (user: User): Promise<UserProfile | null> => {
    if (!db) return null;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = serverTimestamp();
        const newUserProfile: Omit<UserProfile, 'uid' | 'createdAt'> = {
            displayName: displayName || 'New User',
            email: email || '',
            photoURL: photoURL || '',
            role: 'customer' // Default role
        };
        try {
            await setDoc(userRef, {
                ...newUserProfile,
                createdAt,
            });
            const newDoc = await getDoc(userRef);
            return { uid: newDoc.id, ...newDoc.data() } as UserProfile;
        } catch (error) {
            console.error("Error creating user document", error);
            return null;
        }
    }
    return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authInitialized = !!auth;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await createUserProfileDocument(user);
        setUserProfile(profile);
        if (profile?.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
      } else {
          setIsAdmin(false);
          setUserProfile(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = useCallback(async () => {
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
  }, [router]);

  const signUpWithEmail = useCallback(async (name: string, email: string, pass: string) => {
    if (!auth) {
        throw new Error("Authentication is not available.");
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
            const profile = await createUserProfileDocument(userCredential.user);
            setUser(auth.currentUser); 
            setUserProfile(profile);
        }
        router.push('/dashboard');
    } catch (error) {
        throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
    }
  }, [router]);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    if (!auth) {
        throw new Error("Authentication is not available.");
    }
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/dashboard');
    } catch (error) {
        throw new Error(getFirebaseAuthErrorMessage(error as AuthError));
    }
  }, [router]);
  
  const signOut = useCallback(async () => {
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
  }, [router]);

  const value = useMemo(() => ({ 
      user, 
      userProfile,
      isAdmin,
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
      signInWithGoogle, 
      signOut, 
      authInitialized 
  }), [user, userProfile, isAdmin, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, authInitialized]);

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

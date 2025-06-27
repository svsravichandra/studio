
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
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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

const mapFirebaseUserToProfile = (firebaseUser: User, existingData?: any): Omit<UserProfile, 'uid' | 'createdAt'> => {
    return {
        name: firebaseUser.displayName || existingData?.name || 'New User',
        email: firebaseUser.email || '',
        role: existingData?.role || 'customer', // Default role
        phone: existingData?.phone || '',
        address: existingData?.address || {},
    };
};

const createUserProfileDocument = async (user: User): Promise<UserProfile | null> => {
    if (!db) return null;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const newUserProfileData = mapFirebaseUserToProfile(user);
        try {
            await setDoc(userRef, {
                ...newUserProfileData,
                createdAt: serverTimestamp(),
            });
            const newDoc = await getDoc(userRef);
            const data = newDoc.data();
            const createdAtTimestamp = data?.createdAt as Timestamp;
            return { uid: newDoc.id, ...data, createdAt: createdAtTimestamp?.toDate().toISOString() } as UserProfile;
        } catch (error) {
            console.error("Error creating user document", error);
            return null;
        }
    }
    
    const data = snapshot.data();
    const createdAtTimestamp = data.createdAt as Timestamp;
    return { uid: snapshot.id, ...data, createdAt: createdAtTimestamp?.toDate().toISOString() } as UserProfile;
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
        setIsAdmin(profile?.role === 'admin');
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
      console.error("Cannot sign in: Firebase is not initialized.");
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
            // Re-fetch the user to get the updated profile
            const updatedUser = auth.currentUser;
            if(updatedUser) {
              const profile = await createUserProfileDocument(updatedUser);
              setUser(updatedUser);
              setUserProfile(profile);
            }
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

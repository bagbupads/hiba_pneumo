import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Patient, Doctor } from '../types/firebase';

interface AuthContextType {
  user: User | null;
  userData: Patient | Doctor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (email: string, password: string, patientData: any) => Promise<void>;
  registerDoctor: (email: string, password: string, doctorData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Patient | Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Essayer de récupérer d'abord comme patient
        let data = await getCurrentUserData(user.uid, 'patient');
        
        if (!data) {
          // Si pas patient, essayer comme docteur
          data = await getCurrentUserData(user.uid, 'doctor');
        }
        
        setUserData(data as Patient | Doctor);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getCurrentUserData = async (userId: string, userType: 'patient' | 'doctor') => {
    try {
      const docRef = doc(db, `${userType}s`, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerPatient = async (email: string, password: string, patientData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'patients', userCredential.user.uid), {
      ...patientData,
      userType: 'patient',
      createdAt: new Date()
    });
  };

  const registerDoctor = async (email: string, password: string, doctorData: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'doctors', userCredential.user.uid), {
      ...doctorData,
      userType: 'doctor',
      createdAt: new Date()
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      login,
      registerPatient,
      registerDoctor,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // IMPORTS MANQUANTS
import { auth, db } from '../lib/firebase';
import { Patient, Doctor } from '../types/firebase';

export class AuthService {
  static async registerPatient(
    email: string, 
    password: string, 
    patientData: Omit<Patient, 'id' | 'createdAt' | 'userType'>
  ) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'patients', userCredential.user.uid), {
      ...patientData,
      userType: 'patient',
      createdAt: new Date()
    });

    return userCredential.user;
  }

  static async registerDoctor(
    email: string,
    password: string,
    doctorData: Omit<Doctor, 'id' | 'createdAt' | 'userType'>
  ) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'doctors', userCredential.user.uid), {
      ...doctorData,
      userType: 'doctor',
      createdAt: new Date()
    });

    return userCredential.user;
  }

  static async login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  static async logout() {
    return await firebaseSignOut(auth);
  }

  static async getCurrentUserData(userId: string, userType: 'patient' | 'doctor') {
    const docRef = doc(db, `${userType}s`, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }
}
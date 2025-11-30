import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Patient } from '../types/firebase';

export class PatientService {
  static async getPatientsByDoctor(doctorId: string) {
    const q = query(
      collection(db, 'patients'),
      where('assignedDoctor', '==', doctorId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
  }

  static async getAllPatients() {
    const querySnapshot = await getDocs(collection(db, 'patients'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
  }
}
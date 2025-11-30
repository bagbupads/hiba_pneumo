import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { VitalSigns } from "../types/firebase";

export class VitalSignsService {
  // Créer une nouvelle mesure
  static async createVitalSigns(vitalSignsData: Omit<VitalSigns, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'vitalSigns'), {
        ...vitalSignsData,
        recorded_at: Timestamp.now()
      });
      console.log('✅ Signes vitaux créés avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur création signes vitaux:', error);
      throw error;
    }
  }

  // Récupérer l'historique (Correction du nom et de l'index)
  static async getLatestVitalSigns(patientId: string, count: number = 30): Promise<VitalSigns[]> {
    try {
      console.log(`🔍 Fetching vital signs for: ${patientId}`);
      
      const q = query(
        collection(db, 'vitalSigns'),
        where('patientId', '==', patientId),
        orderBy('recorded_at', 'desc'), // Nécessite un Index Firebase
        limit(count)
      );
      
      const querySnapshot = await getDocs(q);
      
      console.log(`📄 Documents trouvés: ${querySnapshot.size}`);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Conversion sécurisée du Timestamp Firestore en Date JS
        const recordedAt = data.recorded_at instanceof Timestamp 
          ? data.recorded_at.toDate() 
          : new Date(data.recorded_at);

        return {
          id: doc.id,
          ...data,
          recorded_at: recordedAt
        } as VitalSigns;
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération signes vitaux:', error);
      if (error.message.includes("index")) {
        console.error("🚨 INDEX MANQUANT : Ouvrez la console du navigateur et cliquez sur le lien fourni par Firebase !");
      }
      return [];
    }
  }

  // Récupérer une mesure par son ID
  static async getVitalSignsById(id: string): Promise<VitalSigns | null> {
    try {
      const docRef = doc(db, 'vitalSigns', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          recorded_at: data.recorded_at.toDate()
        } as VitalSigns;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération par ID:', error);
      return null;
    }
  }
}
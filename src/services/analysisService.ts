import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { AIAnalysis } from "../types/firebase";

export class AnalysisService {
  static async createAnalysis(analysisData: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<string> {
    try {
      // Nettoyer les données : supprimer les champs undefined
      const cleanData: any = {};
      
      Object.keys(analysisData).forEach(key => {
        const value = (analysisData as any)[key];
        if (value !== undefined && value !== null) {
          cleanData[key] = value;
        }
      });

      console.log('📊 Données analyse nettoyées:', cleanData);

      const docRef = await addDoc(collection(db, 'aiAnalyses'), {
        ...cleanData,
        created_at: Timestamp.now()
      });
      
      console.log('✅ Analyse sauvegardée avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur création analyse:', error);
      throw error;
    }
  }

  static async getLatestAnalysis(patientId: string): Promise<AIAnalysis | null> {
    try {
      const q = query(
        collection(db, 'aiAnalyses'),
        where('patientId', '==', patientId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at.toDate()
      } as AIAnalysis;
    } catch (error) {
      console.error('❌ Erreur récupération analyse:', error);
      return null;
    }
  }
}
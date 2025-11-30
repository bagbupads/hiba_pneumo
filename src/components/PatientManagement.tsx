// components/PatientManagement.tsx
import { useState, useEffect } from 'react';
import { Plus, Search, Users, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { PatientService } from '../services/patientService';
import { Patient } from '../types/firebase';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

interface PatientManagementProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

export default function PatientManagement({ onPatientSelect, selectedPatient }: PatientManagementProps) {
  const { user } = useFirebaseAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const patientList = await PatientService.getPatientsByUser(user!.uid);
      setPatients(patientList);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await PatientService.deletePatient(patientId);
        await loadPatients();
        if (selectedPatient?.id === patientId) {
          onPatientSelect(patients[0] || null);
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Erreur lors de la suppression du patient');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-7 h-7 text-blue-600" />
              <span>Gestion des Patients</span>
            </h2>
            <p className="text-gray-600 mt-1">
              {patients.length} patient{patients.length !== 1 ? 's' : ''} enregistré{patients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Patient</span>
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          {filteredPatients.map(patient => (
            <PatientCard 
              key={patient.id} 
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onSelect={() => onPatientSelect(patient)}
              onEdit={() => setEditingPatient(patient)}
              onDelete={() => handleDeletePatient(patient.id)}
            />
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucun patient trouvé</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                Ajouter votre premier patient
              </button>
            </div>
          )}
        </div>
      </div>

      {(showForm || editingPatient) && (
        <PatientForm
          patient={editingPatient}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
            loadPatients();
          }}
        />
      )}
    </div>
  );
}

function PatientCard({ 
  patient, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  patient: Patient;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`border rounded-xl p-5 transition-all duration-300 ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <button
            onClick={onSelect}
            className="text-left w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
              {patient.fullName}
            </h3>
          </button>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>{patient.phoneNumber || 'Non renseigné'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                Créé le {patient.createdAt.toLocaleDateString('fr-FR')}
              </span>
            </span>
          </div>
          {patient.medicalHistory && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {patient.medicalHistory}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onSelect}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            Sélectionner
          </button>
          <button 
            onClick={onEdit}
            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientForm({ patient, onClose }: { patient?: Patient | null; onClose: () => void }) {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: patient?.fullName || '',
    email: patient?.email || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '' as 'male' | 'female' | 'other',
    phoneNumber: patient?.phoneNumber || '',
    emergencyContact: patient?.emergencyContact || '',
    medicalHistory: patient?.medicalHistory || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (patient) {
        // Mise à jour
        await PatientService.updatePatient(patient.id, formData);
      } else {
        // Création
        await PatientService.createPatient({
          ...formData,
          createdBy: user!.uid
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Erreur lors de la sauvegarde du patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {patient ? 'Modifier le patient' : 'Nouveau Patient'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom Complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact d'urgence
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom et téléphone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antécédents médicaux
            </label>
            <textarea
              rows={4}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Antécédents médicaux, allergies, traitements en cours..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : patient ? 'Modifier' : 'Créer le patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
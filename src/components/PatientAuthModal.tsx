import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Calendar, Stethoscope, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  // Ajout de la fonction pour changer de mode (si vous utilisez le même composant pour switch)
  onSwitchMode: () => void; 
}

export default function PatientAuthModal({ isOpen, onClose, mode, onSwitchMode }: PatientAuthModalProps) {
  const { login, registerPatient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other',
    phoneNumber: '',
    emergencyContact: '', // Champ non utilisé dans le formulaire initial, mais conservé
    medicalHistory: '',
    assignedDoctor: '' as 'hammi' | 'bouti' | 'dalal' | 'soumia' | ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Petite pause pour l'effet de chargement
      await new Promise(resolve => setTimeout(resolve, 500)); 

      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        if (!formData.assignedDoctor) {
          throw new Error('Veuillez sélectionner votre médecin référent.');
        }
        await registerPatient(formData.email, formData.password, formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Identifiants incorrects.' : 'Erreur lors de l\'inscription.'));
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la fermeture lorsque l'utilisateur clique en dehors de la modale
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const IconComponent = mode === 'login' ? LogIn : User;
  const title = mode === 'login' ? 'Connexion Patient' : 'Création de Compte';
  const subtitle = mode === 'login' 
    ? 'Accédez à votre espace de suivi santé.' 
    : 'Veuillez remplir le formulaire pour vous inscrire.';
  const submitText = mode === 'login' ? 'Se connecter' : 'Créer mon compte';
  
  // Fonction de mise à jour pour le champ select
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value as any });
  };


  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-8"
      onClick={handleBackdropClick} 
    >
      {/* Conteneur principal (Modale) */}
      <div className="bg-white rounded-3xl sm:shadow-3xl sm:shadow-blue-300/30 max-w-lg w-full relative 
                    border border-gray-100 transform transition-all duration-300
                     
                     /* UX FIXE/DÉFILANT */
                     h-full sm:h-auto sm:max-h-[95vh] rounded-none sm:rounded-3xl flex flex-col" 
      >
        {/* 1. En-tête (Fixe) */}
        <div className="flex-shrink-0 p-4 sm:p-8 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl mb-3 shadow-xl shadow-blue-400/30">
              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1">
              {title}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 2. Corps du Formulaire (Défilant si besoin) */}
        <div className="flex-grow p-4 sm:p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Champs d'Inscription (Affichés uniquement en mode 'register') */}
            {mode === 'register' && (
              <div className='space-y-6'>
                
                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet *</label>
                  <div className="relative shadow-sm">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                      placeholder="Nom Complet"
                    />
                  </div>
                </div>

                {/* Date de naissance & Genre (Grid responsive) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance</label>
                    <div className="relative shadow-sm">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800 appearance-none"
                    >
                      <option value="" disabled>Sélectionner</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <div className="relative shadow-sm">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                      placeholder="+212 1 23 45 67 89"
                    />
                  </div>
                </div>
                
                {/* Médecin Traitant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Médecin référent *</label>
                  <div className="relative shadow-sm">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <select
                      required
                      value={formData.assignedDoctor}
                      onChange={(e) => updateFormData('assignedDoctor', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800 appearance-none"
                    >
                      <option value="" disabled>Choisir votre médecin</option>
                      <option value="hammi">Dr. HAMMI Sanae</option>
                      <option value="bouti">Dr. BOUTI Khalid</option>
                      <option value="dalal">Dr. ZAGAOUCH Dalal</option>
                      <option value="soumia">Dr. FDIL Soumia</option>
                    </select>
                  </div>
                </div>


                
              </div>
            )}

            {/* Champs communs (Email & Password) */}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <div className="relative shadow-sm">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                  placeholder="vous@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
              <div className="relative shadow-sm">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            {/* Bouton de Soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-bold text-lg 
                        hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'login' ? 'Connexion en cours...' : 'Inscription en cours...'}</span>
                </div>
              ) : (
                submitText
              )}
            </button>

          </form>
        </div>


      </div>
    </div>
  );
}
import { useState } from 'react';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function PatientLoginModal({ isOpen, onClose, onSwitchToRegister }: PatientLoginModalProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simuler une légère attente pour l'effet visuel de loading
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // Tentative de connexion réelle
      await login(formData.email, formData.password);
      onClose();
    } catch (err: any) {
      // Utilisez un message générique pour la sécurité
      setError('Identifiants incorrects ou compte non trouvé.'); 
    } finally {
      setLoading(false);
    }
  };

  // Gérer la fermeture lorsque l'utilisateur clique en dehors de la modale (responsive UX)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-8"
      onClick={handleBackdropClick} // Clic en dehors pour fermer
    >
      <div className="bg-white rounded-3xl shadow-3xl shadow-blue-300/30 max-w-sm w-full p-6 sm:p-10 relative 
                    border border-gray-100 transform transition-all duration-300
                    
                    /* CLASSES DE CORRECTION ICI */
                    max-h-[95vh] overflow-y-auto" 
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-4 shadow-xl shadow-blue-400/30">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Bienvenue, Patient
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Connectez-vous pour accéder à votre suivi à distance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse Email
            </label>
            <div className="relative shadow-sm">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                placeholder="email@gmail.com"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative shadow-sm">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition-all text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Message d'Erreur */}
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
                      hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connexion en cours...</span>
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Lien vers l'inscription */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className='text-gray-600 mb-2 text-sm'>Vous êtes nouveau ?</p>
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-blue-600 hover:text-blue-700 font-bold transition-colors text-base"
          >
            S'inscrire maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
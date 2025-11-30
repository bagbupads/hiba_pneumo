import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import PatientAuthModal from './components/PatientAuthModal';
import PatientLoginModal from './components/PatientLoginModal'; // AJOUTER
import DoctorAuthModal from './components/DoctorAuthModal';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';

function AppContent() {
  const { user, userData, loading } = useAuth();
  const [showPatientAuth, setShowPatientAuth] = useState(false);
  const [showPatientLogin, setShowPatientLogin] = useState(false); // AJOUTER
  const [showDoctorAuth, setShowDoctorAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user && userData) {
    if (userData.userType === 'patient') {
      return <PatientDashboard />;
    } else if (userData.userType === 'doctor') {
      return <DoctorDashboard />;
    }
  }

  return (
    <>
      <LandingPage
        onPatientLogin={() => setShowPatientLogin(true)} // MODIFIER
        onDoctorLogin={() => setShowDoctorAuth(true)}
        onPatientRegister={() => {
          setAuthMode('register');
          setShowPatientAuth(true);
        }}
      />

      <PatientAuthModal
        isOpen={showPatientAuth}
        onClose={() => setShowPatientAuth(false)}
        mode={authMode}
      />

      <PatientLoginModal // AJOUTER
        isOpen={showPatientLogin}
        onClose={() => setShowPatientLogin(false)}
        onSwitchToRegister={() => {
          setShowPatientLogin(false);
          setAuthMode('register');
          setShowPatientAuth(true);
        }}
      />

      <DoctorAuthModal
        isOpen={showDoctorAuth}
        onClose={() => setShowDoctorAuth(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
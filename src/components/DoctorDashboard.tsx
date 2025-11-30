import { useState, useEffect, useMemo } from 'react';
import { 
  LogOut, Activity, Calendar, User, Search, ChevronRight, 
  Stethoscope, Phone, Clock, Heart, Wind, Thermometer, Droplet,
  AlertCircle, Menu, X, FileText, ShieldAlert, Zap, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Doctor, Patient, VitalSigns } from '../types/firebase';
import { PatientService } from '../services/patientService';
import { VitalSignsService } from '../services/vitalSignsService';

// --- UTILITAIRES ---
const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
const formatTime = (date: Date) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
const formatMonthLabel = (date: Date) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "--";
    const dob = new Date(dateOfBirth);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};

// --- LOGIQUE COULEURS & SEUILS MÉDICAUX ---
const getStatusColor = (type: string, value: any, value2?: any) => {
    if (!value) return 'slate'; 
    switch (type) {
        case 'temperature':
            if (value < 36.5 || value > 37.8) return 'rose'; 
            return 'emerald'; 
        case 'bp':
            if (value < 100 || value > 135 || (value2 && (value2 < 60 || value2 > 85))) return 'rose';
            return 'indigo'; 
        case 'heart_rate':
            if (value < 55 || value > 100) return 'rose';
            return 'emerald';
        case 'respiratory_rate':
            if (value < 12 || value > 22) return 'rose';
            return 'cyan'; 
        case 'spo2':
            if (value < 95) return 'rose';
            return 'blue'; 
        default: return 'slate';
    }
};

// Fonction pour déterminer si un patient est en état dangereux
const isPatientInDanger = (vitals: VitalSigns[]) => {
    if (!vitals || vitals.length === 0) return false;
    
    const latestVital = vitals[vitals.length - 1];
    
    // Vérification des paramètres vitaux critiques
    if (latestVital.temperature && (latestVital.temperature < 36 || latestVital.temperature > 39)) return true;
    if (latestVital.spo2 && latestVital.spo2 < 92) return true;
    if (latestVital.heart_rate && (latestVital.heart_rate < 50 || latestVital.heart_rate > 120)) return true;
    if (latestVital.systolic_bp && (latestVital.systolic_bp < 90 || latestVital.systolic_bp > 180)) return true;
    if (latestVital.diastolic_bp && (latestVital.diastolic_bp < 50 || latestVital.diastolic_bp > 110)) return true;
    if (latestVital.respiratory_rate && (latestVital.respiratory_rate < 10 || latestVital.respiratory_rate > 30)) return true;
    
    // Vérification des symptômes dangereux
    if (latestVital.hemoptysis_present && latestVital.hemoptysis_quantity === 'abondante') return true;
    
    return false;
};

// ==================================================================================
// COMPOSANT PRINCIPAL : DOCTOR DASHBOARD
// ==================================================================================

export default function DoctorDashboard() {
  const { userData, logout } = useAuth();
  const doctor = userData as Doctor;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVitals, setPatientVitals] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patientDangerStatus, setPatientDangerStatus] = useState<{[key: string]: boolean}>({});

  // Chargement initial
  useEffect(() => {
    if (doctor?.doctorId) loadPatients();
  }, [doctor]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await PatientService.getPatientsByDoctor(doctor.doctorId);
      setPatients(data);
      
      // Charger les statuts de danger pour chaque patient
      const dangerStatus: {[key: string]: boolean} = {};
      for (const patient of data) {
        try {
          const vitals = await VitalSignsService.getLatestVitalSigns(patient.id, 10);
          dangerStatus[patient.id] = isPatientInDanger(vitals);
        } catch (error) {
          console.error(`Erreur chargement vitals patient ${patient.id}:`, error);
          dangerStatus[patient.id] = false;
        }
      }
      setPatientDangerStatus(dangerStatus);
      
      // Sélection auto sur Desktop uniquement
      if (window.innerWidth > 768 && data.length > 0) handleSelectPatient(data[0]);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsSidebarOpen(false);
    try {
        const vitals = await VitalSignsService.getLatestVitalSigns(patient.id, 150);
        const sortedVitals = vitals.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
        setPatientVitals(sortedVitals);
        
        // Mettre à jour le statut de danger
        setPatientDangerStatus(prev => ({
          ...prev,
          [patient.id]: isPatientInDanger(vitals)
        }));
    } catch (error) {
        console.error("Erreur vitals:", error);
        setPatientVitals([]);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!doctor) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-2xl shadow-slate-200/50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Sidebar */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100/50">
           <div className="flex items-center gap-3">
                <img 
                    src="/media/logo.png" 
                    alt="PNEUMO Suivie Logo" 
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                    onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    }}
                />
               <div>
                   <h1 className="font-bold text-lg tracking-tight text-slate-900">PNEUMO SuitVie<span className="text-indigo-600">.</span></h1>
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Médecin</p>
               </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto p-2 text-slate-400">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Search */}
        <div className="p-5 pb-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
            </div>
        </div>

        {/* Liste Patients */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Vos Patients ({filteredPatients.length})</div>
            {filteredPatients.map(patient => (
                <PatientListItem 
                    key={patient.id} 
                    patient={patient} 
                    isSelected={selectedPatient?.id === patient.id} 
                    isInDanger={patientDangerStatus[patient.id] || false}
                    onSelect={() => handleSelectPatient(patient)} 
                />
            ))}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                    {doctor.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">Dr. {doctor.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{doctor.specialty}</p>
                </div>
                <button onClick={() => logout()} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Déconnexion">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
      </aside>

      {/* --- OVERLAY MOBILE --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-[#F8FAFC]">
        {/* Header Mobile Only */}
        <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
             <div className="flex items-center gap-2">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-bold text-slate-800">Pneumo.Pro</span>
             </div>
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                 {doctor.fullName.charAt(0)}
             </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 pb-20">
                
                {/* 1. Welcome Card */}
                <DoctorWelcomeHeader doctor={doctor} patientCount={patients.length} />

                {selectedPatient ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                        
                        {/* 2. Patient Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div>
                                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedPatient.fullName}</h2>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {calculateAge(selectedPatient.dateOfBirth)} ans</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {selectedPatient.phoneNumber || "N/A"}</span>
                                    {patientDangerStatus[selectedPatient.id] && (
                                      <>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center text-rose-600 font-bold">
                                          <AlertCircle className="w-3 h-3 mr-1" /> État critique
                                        </span>
                                      </>
                                    )}
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                onClick={() => window.open(`tel:${selectedPatient.phoneNumber}`)}
                                disabled={!selectedPatient.phoneNumber}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                <Phone className="w-4 h-4" /> 
                                {selectedPatient.phoneNumber ? "Contacter" : "Tél. non disponible"}
                                </button>
                             </div>
                        </div>

                        {/* 3. BENTO GRID - GRAPHIQUES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            
                            {/* SpO2 - Large */}
                            <AdvancedChartCard 
                                title="Saturation SpO₂"
                                data={patientVitals}
                                dataKey="spo2"
                                unit="%"
                                icon={<Droplet className="w-5 h-5" />}
                                domain={[80, 100]}
                                targetRange="95-100"
                                type="spo2"
                                className="md:col-span-2 xl:col-span-2" 
                            />

                            <AdvancedChartCard 
                                title="Fréquence Respi."
                                data={patientVitals}
                                dataKey="respiratory_rate"
                                unit="/min"
                                icon={<Wind className="w-5 h-5" />}
                                domain={[5, 40]}
                                targetRange="12-20"
                                type="respiratory_rate"
                            />

                            <SymptomSummaryCard vitals={patientVitals} />

                            <AdvancedChartCard 
                                title="Température"
                                data={patientVitals}
                                dataKey="temperature"
                                unit="°C"
                                icon={<Thermometer className="w-5 h-5" />}
                                domain={[35, 41]}
                                targetRange="36.5-37.5"
                                type="temperature"
                            />

                            <AdvancedChartCard 
                                title="Fréq. Cardiaque"
                                data={patientVitals}
                                dataKey="heart_rate"
                                unit="bpm"
                                icon={<Heart className="w-5 h-5" />}
                                domain={[40, 160]}
                                targetRange="60-100"
                                type="heart_rate"
                            />

                            {/* Tension - Large */}
                            <AdvancedChartCard 
                                title="Tension Artérielle"
                                data={patientVitals}
                                dataKey="systolic_bp"
                                secondaryDataKey="diastolic_bp"
                                unit="mmHg"
                                icon={<Activity className="w-5 h-5" />}
                                domain={[50, 200]}
                                targetRange="120/80"
                                type="bp"
                                className="md:col-span-2 xl:col-span-2"
                            />
                        </div>

                        {/* 4. TABLEAU HISTORIQUE COMPLET */}
                        <CompleteHistoryTable vitals={patientVitals} />

                    </div>
                ) : (
                   /* Empty State */
                   <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-indigo-100 flex items-center justify-center mb-6 animate-bounce-slow">
                            <Stethoscope className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Sélectionnez un patient</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Accédez au dossier médical complet et aux constantes en temps réel.</p>
                   </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

// ==================================================================================
// SOUS-COMPOSANTS
// ==================================================================================

// 1. Loading
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
             <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
          </div>
      </div>
    </div>
  );
}

// 2. Header Welcome
function DoctorWelcomeHeader({ doctor, patientCount }: { doctor: Doctor, patientCount: number }) {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl shadow-indigo-900/20 p-8 md:p-10 group border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                     <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                        Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Dr. {doctor.fullName}</span>
                     </h1>
                     <p className="text-slate-400 text-sm md:text-base">
                        Vous suivez actuellement <strong className="text-white">{patientCount} patients</strong>.
                     </p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                     <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                         <Calendar className="w-6 h-6 text-white" />
                     </div>
                     <div>
                         <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Aujourd'hui</p>
                         <p className="text-lg font-bold capitalize">{today}</p>
                     </div>
                </div>
            </div>
        </div>
    )
}

// 3. Patient List Item (avec état dangereux)
function PatientListItem({ patient, isSelected, isInDanger, onSelect }: any) {
  return (
    <button
      onClick={onSelect}
      className={`w-full group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 border ${
        isSelected
          ? isInDanger
            ? 'bg-rose-600 border-rose-500 shadow-xl shadow-rose-500/30 translate-x-1'
            : 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/30 translate-x-1'
          : isInDanger
            ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
      }`}
    >
      {/* Indicateur d'état dangereux */}
      {isInDanger && !isSelected && (
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
      )}
      
      <div className={`
        relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300
        ${isSelected 
          ? isInDanger 
            ? 'bg-white text-rose-600 rotate-3 scale-105' 
            : 'bg-white text-indigo-600 rotate-3 scale-105'
          : isInDanger
            ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-200'
            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
        }
      `}>
        {patient.fullName.charAt(0)}
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3 className={`font-bold text-sm truncate transition-colors ${
          isSelected 
            ? 'text-white' 
            : isInDanger 
              ? 'text-rose-800'
              : 'text-slate-700'
        }`}>
          {patient.fullName}
          {isInDanger && !isSelected && (
            <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">URGENT</span>
          )}
        </h3>
        <p className={`text-xs truncate transition-colors ${
          isSelected 
            ? isInDanger 
              ? 'text-rose-200'
              : 'text-indigo-200'
            : isInDanger
              ? 'text-rose-600'
              : 'text-slate-400'
        }`}>
           ID: {patient.id.slice(0,6)}
        </p>
      </div>
      {isSelected && (
        <ChevronRight className={`w-5 h-5 ${
          isInDanger ? 'text-white' : 'text-white'
        } absolute right-3`} />
      )}
    </button>
  );
}

// 4. CHART CARD AVEC MIN / MAX / AVG
function AdvancedChartCard({ title, data, dataKey, unit, icon, domain, targetRange, type, secondaryDataKey, className = "" }: any) {
  const values = data.map((d: any) => Number(d[dataKey]) || 0).filter((v: number) => v > 0);
  const hasData = values.length > 0;
  const lastValue = hasData ? values[values.length - 1] : 0;
  const lastSecondaryValue = (hasData && secondaryDataKey) ? data[data.length -1][secondaryDataKey] : null;
  const colorState = getStatusColor(type, lastValue, lastSecondaryValue); 

  // --- STATISTIQUES (CALCUL) ---
  const minVal = hasData ? Math.min(...values) : 0;
  const maxVal = hasData ? Math.max(...values) : 0;
  const avgVal = hasData ? (values.reduce((a: number,b: number) => a+b, 0) / values.length).toFixed(1) : 0;

  // Thèmes
  const themes: any = {
      emerald: { stroke: '#10b981', fillStart: '#10b981', fillEnd: '#ffffff', text: 'text-emerald-600', bgIcon: 'bg-emerald-100 text-emerald-600' },
      blue:    { stroke: '#3b82f6', fillStart: '#3b82f6', fillEnd: '#ffffff', text: 'text-blue-600',    bgIcon: 'bg-blue-100 text-blue-600' },
      indigo:  { stroke: '#6366f1', fillStart: '#6366f1', fillEnd: '#ffffff', text: 'text-indigo-600',  bgIcon: 'bg-indigo-100 text-indigo-600' },
      cyan:    { stroke: '#06b6d4', fillStart: '#06b6d4', fillEnd: '#ffffff', text: 'text-cyan-600',    bgIcon: 'bg-cyan-100 text-cyan-600' },
      rose:    { stroke: '#f43f5e', fillStart: '#f43f5e', fillEnd: '#ffffff', text: 'text-rose-600',    bgIcon: 'bg-rose-100 text-rose-600' },
      slate:   { stroke: '#94a3b8', fillStart: '#94a3b8', fillEnd: '#ffffff', text: 'text-slate-500',   bgIcon: 'bg-slate-100 text-slate-500' }
  };
  const t = themes[colorState] || themes.slate;

  // SVG Logic
  const width = 200;
  const height = 80;
  const chartData = values.slice(-15); 
  const points = chartData.map((val: number, i: number, arr: number[]) => {
    const x = arr.length > 1 ? (i / (arr.length - 1)) * width : width / 2;
    const normalizedY = Math.max(0, Math.min(1, (val - domain[0]) / (domain[1] - domain[0])));
    const y = height - (normalizedY * height);
    return `${x},${y}`;
  }).join(' ');

  const fillPath = chartData.length > 1 ? `M0,${height} ${points} L${width},${height} Z` : "";

  return (
    <div className={`relative bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between ${className}`}>
        
        <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${t.bgIcon} transition-colors`}>{icon}</div>
                    <div>
                        <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cible: {targetRange}</span>
                    </div>
                </div>
                {colorState === 'rose' && (
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                )}
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-extrabold tracking-tight ${t.text}`}>
                    {hasData ? lastValue : '--'}
                </span>
                {lastSecondaryValue && <span className="text-2xl font-bold text-slate-400">/{lastSecondaryValue}</span>}
                <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>
            </div>

            {/* Graph */}
            <div className="h-20 w-full overflow-hidden relative mb-4">
                {hasData ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`grad-${dataKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={t.fillStart} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={t.fillEnd} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={fillPath} fill={`url(#grad-${dataKey})`} className="transition-all duration-500" />
                        <polyline fill="none" stroke={t.stroke} strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                ) : (
                    <div className="flex items-center justify-center h-full border border-dashed border-slate-200 rounded-lg">
                        <span className="text-xs text-slate-300">Pas de données</span>
                    </div>
                )}
            </div>
        </div>

        {/* --- FOOTER: MIN / AVG / MAX --- */}
        {hasData && (
             <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3 mt-auto">
                 <div className="text-center px-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Min</p>
                     <p className="font-bold text-slate-700 text-sm">{minVal}</p>
                 </div>
                 <div className="text-center px-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Moy</p>
                     <p className={`font-bold text-sm ${t.text}`}>{avgVal}</p>
                 </div>
                 <div className="text-center px-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Max</p>
                     <p className="font-bold text-slate-700 text-sm">{maxVal}</p>
                 </div>
             </div>
        )}
    </div>
  );
}

// 5. SYMPTOM CARD (DASHBOARD GRID)
function SymptomSummaryCard({ vitals }: { vitals: VitalSigns[] }) {
    const latest = vitals.length > 0 ? vitals[vitals.length - 1] : null;
    const hasHemo = latest?.hemoptysis_present;
    const hasSputum = latest?.sputum_present;

    if (!latest || (!hasHemo && !hasSputum)) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center group hover:border-indigo-100 transition-colors">
                 <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <Zap className="w-6 h-6 text-slate-400" />
                 </div>
                 <h4 className="font-bold text-slate-600">État Stable</h4>
                 <p className="text-xs text-slate-400 mt-1">Aucun symptôme récent.</p>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-red-100 shadow-[0_8px_30px_rgb(254,202,202,0.15)] group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-red-50 text-red-600"><ShieldAlert className="w-5 h-5" /></div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Symptômes</h4>
                        <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider flex items-center gap-1">Attention</span>
                    </div>
                </div>
            </div>
            <div className="space-y-3 relative z-10">
                {hasHemo && (
                    <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                        <span className="text-sm font-bold text-red-800">Hémoptysie</span>
                        <span className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded shadow-sm uppercase">{latest.hemoptysis_quantity}</span>
                    </div>
                )}
                {hasSputum && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="text-sm font-bold text-amber-800 block mb-1">Expectorations</span>
                        <div className="flex gap-2">
                             <span className="text-[10px] font-bold bg-white text-amber-700 px-1.5 py-0.5 rounded border border-amber-100 uppercase">{latest.sputum_color}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 6. TABLEAU HISTORIQUE COMPLET AVEC TOUS LES PARAMÈTRES
function CompleteHistoryTable({ vitals }: { vitals: VitalSigns[] }) {
    // Liste des mois disponibles
    const availableMonths = useMemo(() => {
        const months = new Map();
        vitals.forEach(v => {
            const d = new Date(v.recorded_at);
            const key = getMonthKey(d);
            if (!months.has(key)) months.set(key, { key, label: formatMonthLabel(d), date: d });
        });
        return Array.from(months.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [vitals]);

    const [selectedMonth, setSelectedMonth] = useState<string>('');

    // Mise à jour si le patient change
    useEffect(() => {
        if (availableMonths.length > 0) setSelectedMonth(availableMonths[0].key);
    }, [availableMonths]);

    // Filtrage
    const filteredVitals = useMemo(() => {
        if (!selectedMonth) return [];
        return vitals
            .filter(v => getMonthKey(new Date(v.recorded_at)) === selectedMonth)
            .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    }, [vitals, selectedMonth]);

    if (vitals.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                    <span className="text-lg">Historique Complet des Mesures</span>
                </h3>

                {/* SELECTEUR DE MOIS */}
                <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm min-w-[180px] capitalize"
                    >
                        {availableMonths.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 sticky top-0 backdrop-blur-sm z-0">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Date & Heure</th>
                            <th className="px-6 py-4 font-semibold text-center">Temp.</th>
                            <th className="px-6 py-4 font-semibold text-center">Tension</th>
                            <th className="px-6 py-4 font-semibold text-center">Pouls</th>
                            <th className="px-6 py-4 font-semibold text-center">SpO₂</th>
                            <th className="px-6 py-4 font-semibold text-center">Fréq. Respi.</th>
                            <th className="px-6 py-4 font-semibold w-1/3">Observations & Symptômes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredVitals.map((vital, i) => (
                            <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                                    {formatDate(new Date(vital.recorded_at))} 
                                    <span className="text-slate-400 ml-2 font-normal text-xs">{formatTime(new Date(vital.recorded_at))}</span>
                                </td>
                                <td className="px-6 py-4 text-center"><TableBadge value={vital.temperature} type="temperature" unit="°C" /></td>
                                <td className="px-6 py-4 text-center"><TableBadge value={vital.systolic_bp} value2={vital.diastolic_bp} type="bp" /></td>
                                <td className="px-6 py-4 text-center"><TableBadge value={vital.heart_rate} type="heart_rate" unit="bpm" /></td>
                                <td className="px-6 py-4 text-center"><TableBadge value={vital.spo2} type="spo2" unit="%" /></td>
                                <td className="px-6 py-4 text-center"><TableBadge value={vital.respiratory_rate} type="respiratory_rate" unit="/min" /></td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-2">
                                        {/* Hémoptysie */}
                                        {vital.hemoptysis_present && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 text-red-700 text-xs font-bold w-fit">
                                                <ShieldAlert className="w-3.5 h-3.5" /> 
                                                Hémoptysie : <span className="uppercase text-[10px] ml-0.5 bg-white px-1.5 rounded border border-red-100 text-red-600">{vital.hemoptysis_quantity || "Signalée"}</span>
                                            </span>
                                        )}
                                        {/* Expectorations */}
                                        {vital.sputum_present && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold w-fit">
                                                <Zap className="w-3.5 h-3.5" /> 
                                                Expectorations : <span className="capitalize text-[10px] ml-0.5 bg-white px-1.5 rounded border border-amber-100 text-amber-600">{vital.sputum_color || "Signalées"}</span>
                                            </span>
                                        )}
                                        {/* Notes */}
                                        {vital.notes && (
                                            <span className="inline-flex items-start gap-1.5 text-slate-500 text-xs mt-0.5">
                                                <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                                                <span className="italic leading-snug">"{vital.notes}"</span>
                                            </span>
                                        )}
                                        {/* Rien */}
                                        {!vital.hemoptysis_present && !vital.sputum_present && !vital.notes && (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVitals.length === 0 && <div className="p-8 text-center text-slate-400">Aucune donnée pour ce mois.</div>}
            </div>
        </div>
    )
}

function TableBadge({ value, value2, type, unit }: any) {
    if(!value) return <span className="text-slate-300">-</span>;
    const color = getStatusColor(type, value, value2);
    const colors: any = {
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        cyan: 'text-cyan-600 bg-cyan-50 border-cyan-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
    };
    return (
        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${colors[color] || colors.slate}`}>
            {value}{value2 ? `/${value2}` : ''} {unit && <span className="opacity-60 text-[10px]">{unit}</span>}
        </span>
    )
}
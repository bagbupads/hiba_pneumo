import { useState, useEffect } from 'react';
import { 
  LogOut, Plus, TrendingUp, Calendar, 
  Wind, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Patient, AIAnalysis, VitalSigns } from '../types/firebase';
import { AnalysisService } from '../services/analysisService';
import { VitalSignsService } from '../services/vitalSignsService';
import { analyzeVitalSigns } from '../lib/aiAnalysis';

import VitalSignsForm from './VitalSignsForm';
import AnalysisCard from './AnalysisCard';
import HistoryView from './HistoryView';

export default function PatientDashboard() {
  const { userData, logout } = useAuth();
  const patient = userData as Patient;
  const [activeTab, setActiveTab] = useState<'entry' | 'analysis' | 'history' | 'charts'>('entry');
  const [latestAnalysis, setLatestAnalysis] = useState<AIAnalysis | null>(null);
  const [recentVitalSigns, setRecentVitalSigns] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient) loadDashboardData();
  }, [patient]);

  const loadDashboardData = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const [analysisData, vitalSignsData] = await Promise.all([
        AnalysisService.getLatestAnalysis(patient.id),
        VitalSignsService.getLatestVitalSigns(patient.id, 7)
      ]);

      setRecentVitalSigns(vitalSignsData);

      if (analysisData) {
        setLatestAnalysis(analysisData);
      } else if (vitalSignsData.length > 0) {
        const generatedAnalysis = analyzeVitalSigns(vitalSignsData[0], vitalSignsData.slice(1));
        const fallbackAnalysis: AIAnalysis = {
            id: 'generated-live',
            vitalSignsId: vitalSignsData[0].id,
            patientId: patient.id,
            created_at: new Date(),
            ...generatedAnalysis
        };
        setLatestAnalysis(fallbackAnalysis);
      } else {
        setLatestAnalysis(null);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataSubmitted = () => {
    loadDashboardData(); 
    setActiveTab('analysis'); 
  };

  if (!patient) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-500/20 selection:text-blue-700 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px]" />
      </div>

      {/* --- HEADER --- */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
                <img 
                    src="/media/logo.png" 
                    alt="PNEUMO Suivie Logo" 
                    className="w-13 h-13 sm:w-12 sm:h-12 object-contain"
                    onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    }}
                />
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                PNEUMO SuitVie<span className="text-blue-600">.</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-800 text-sm">{patient.fullName}</p>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Patient
                </p>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
              <button
                onClick={() => logout()}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-300 shadow-sm"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{patient.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Voici votre bilan respiratoire en temps réel.
            </p>
          </div>

        </div>

        {/* Modern Tabs */}
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm inline-flex mb-8 overflow-x-auto max-w-full scrollbar-hide">
          {[
            { id: 'entry', icon: Plus, label: 'Mesure' },
            { id: 'analysis', icon: Sparkles, label: 'Analyse IA', badge: !!latestAnalysis },
            { id: 'history', icon: Calendar, label: 'Historique' },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-[0_4px_20px_-2px_rgba(37,99,235,0.2)] ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
              `}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
              {tab.label}
              {tab.badge && !['analysis'].includes(activeTab) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'entry' && <VitalSignsForm patient={patient} onSubmitted={handleDataSubmitted} />}
          {activeTab === 'analysis' && <AnalysisCard analysis={latestAnalysis} loading={loading} />}
          {activeTab === 'history' && <HistoryView patient={patient} />}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4 shadow-xl"></div>
        <Wind className="w-8 h-8 text-blue-600 absolute top-6 left-6 animate-pulse" />
        <p className="text-slate-400 font-medium animate-pulse">Chargement sécurisé...</p>
      </div>
    </div>
  );
}
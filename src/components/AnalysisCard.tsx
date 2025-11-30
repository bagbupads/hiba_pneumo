import { 
    CheckCircle2, AlertTriangle, ShieldAlert, Activity, 
    Thermometer, Heart, Wind, Droplet, Stethoscope, 
    Lightbulb, ArrowRight, BrainCircuit, Phone, Clock
} from 'lucide-react';
import { AIAnalysis } from '../types/firebase';

interface AnalysisCardProps {
    analysis: AIAnalysis | null;
    loading: boolean;
}

export default function AnalysisCard({ analysis, loading }: AnalysisCardProps) {
    if (loading) return <div className="h-96 w-full bg-slate-100 rounded-[2.5rem] animate-pulse" />;
    
    if (!analysis) return (
        <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
            En attente de votre première mesure...
        </div>
    );

    // 🔥 Logique intelligente pour les recommandations
    const getUrgencyLevel = () => {
        if (analysis.overall_status === 'red' || analysis.health_score < 50) {
            return 'emergency';
        } else if (analysis.overall_status === 'orange' || analysis.health_score < 70) {
            return 'warning';
        } else {
            return 'normal';
        }
    };

    const getMedicalAdvice = () => {
        const urgency = getUrgencyLevel();
        
        switch (urgency) {
            case 'emergency':
                return {
                    title: "🆘 Consultation Médicale Requise",
                    message: "Vos paramètres vitaux présentent des anomalies qui nécessitent une attention médicale rapide.",
                    actions: [
                        { text: "Contacter votre médecin traitant rapidement", urgent: true, icon: Phone },
                        { text: "Ne pas attendre pour consulter", urgent: true, icon: AlertTriangle },
                        { text: "Surveiller l'évolution des symptômes", urgent: false, icon: Activity }
                    ],
                    timeframe: "Dès que possible"
                };
            case 'warning':
                return {
                    title: "⚠️ Surveillance Médicale Recommandée",
                    message: "Certains paramètres nécessitent une attention médicale. Planifiez une consultation.",
                    actions: [
                        { text: "Prendre rendez-vous avec votre médecin", urgent: true, icon: Clock },
                        { text: "Surveiller l'évolution des symptômes", urgent: false, icon: Activity },
                        { text: "Reprendre vos mesures dans 4 heures", urgent: false, icon: Clock }
                    ],
                    timeframe: "Sous 24 heures"
                };
            default:
                return {
                    title: "✅ État Stable",
                    message: "Vos paramètres sont dans les normes. Continuez votre traitement habituel.",
                    actions: [
                        { text: "Prendre le traitement de fond", urgent: false, icon: CheckCircle2 },
                        { text: "Exercice de respiration (5 min)", urgent: false, icon: Wind },
                        { text: "Prochaine mesure demain matin", urgent: false, icon: Clock }
                    ],
                    timeframe: "Routine"
                };
        }
    };

    const medicalAdvice = getMedicalAdvice();

    const statusConfig: any = {
        green: {
            theme: 'emerald',
            bgGradient: 'from-emerald-500 to-teal-600',
            text: 'text-emerald-800',
            icon: CheckCircle2,
            label: "État Stable"
        },
        orange: {
            theme: 'amber',
            bgGradient: 'from-amber-500 to-orange-600',
            text: 'text-amber-800',
            icon: ShieldAlert,
            label: "Attention Requise"
        },
        red: {
            theme: 'rose',
            bgGradient: 'from-rose-500 to-red-600',
            text: 'text-rose-800',
            icon: AlertTriangle,
            label: "Action Immédiate"
        }
    };

    const config = statusConfig[analysis.overall_status] || statusConfig.green;
    const StatusIcon = config.icon;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* CARTE PRINCIPALE */}
            <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${config.bgGradient} text-white shadow-2xl shadow-${config.theme}-500/30 p-8 sm:p-12`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
                            <StatusIcon className="w-4 h-4" />
                            {config.label}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                            Bilan Santé Journalier
                        </h2>
                        <p className="text-white/90 text-lg leading-relaxed max-w-2xl font-medium">
                            {analysis.daily_summary}
                        </p>
                        
                        {/* 🔥 Message de contact médecin */}
                        {getUrgencyLevel() === 'emergency' && (
                            <div className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                    <span className="font-bold text-lg">Vous devez contacter votre médecin au plus vite !</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 flex flex-col items-center justify-center min-w-[160px] shadow-lg">
                        <span className="text-7xl sm:text-8xl font-black tracking-tighter">{analysis.health_score}</span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80 mt-2">Score / 100</span>
                    </div>
                </div>
            </div>

            {/* GRILLE DÉTAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard icon={Thermometer} label="Température" message={analysis.temperature_message} status={analysis.temperature_status} />
                <DetailCard icon={Activity} label="Tension" message={analysis.bp_message} status={analysis.bp_status} />
                <DetailCard icon={Heart} label="Fréquence Cardiaque" message={analysis.heart_rate_message} status={analysis.heart_rate_status} />
                <DetailCard icon={Wind} label="Respiration" message={analysis.respiratory_message} status={analysis.respiratory_status} />
                <DetailCard icon={Droplet} label="Oxygène (SpO2)" message={analysis.spo2_message} status={analysis.spo2_status} />
                
                {(analysis.sputum_analysis || analysis.hemoptysis_warning) && (
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400" />
                        <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" /> Symptômes
                        </h4>
                        <p className="text-sm text-slate-600 font-medium">
                            {analysis.hemoptysis_warning || analysis.sputum_analysis}
                        </p>
                    </div>
                )}
            </div>

            {/* SECTION RECOMMANDATIONS */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                    <div className={`p-4 ${
                        getUrgencyLevel() === 'emergency' ? 'bg-red-50 text-red-600' : 
                        getUrgencyLevel() === 'warning' ? 'bg-amber-50 text-amber-600' : 
                        'bg-blue-50 text-blue-600'
                    } rounded-2xl`}>
                        <Stethoscope className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{medicalAdvice.title}</h3>
                        <p className="text-slate-600 mt-2 font-medium">{medicalAdvice.message}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4" /> Analyse Prédictive
                        </h4>
                        <div className={`rounded-[2rem] p-8 border ${
                            getUrgencyLevel() === 'emergency' ? 'bg-red-50 border-red-100' : 
                            getUrgencyLevel() === 'warning' ? 'bg-amber-50 border-amber-100' : 
                            'bg-slate-50 border-slate-100'
                        }`}>
                            <p className={`leading-relaxed font-medium italic text-lg ${
                                getUrgencyLevel() === 'emergency' ? 'text-red-700' : 
                                getUrgencyLevel() === 'warning' ? 'text-amber-700' : 
                                'text-slate-700'
                            }`}>
                                {getUrgencyLevel() === 'emergency' 
                                    ? "« D'après l'analyse de vos constantes, une consultation médicale est nécessaire. Contactez votre médecin traitant pour une évaluation. »"
                                    : getUrgencyLevel() === 'warning'
                                    ? "« Vos résultats montrent des variations qui méritent une attention médicale. Planifiez une consultation avec votre médecin. »"
                                    : "« D'après vos constantes, nous recommandons de maintenir votre traitement actuel. Aucune anomalie majeure détectée. »"
                                }
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Actions recommandées
                            </h4>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                getUrgencyLevel() === 'emergency' ? 'bg-red-100 text-red-700' : 
                                getUrgencyLevel() === 'warning' ? 'bg-amber-100 text-amber-700' : 
                                'bg-emerald-100 text-emerald-700'
                            }`}>
                                {medicalAdvice.timeframe}
                            </span>
                        </div>
                        <ul className="space-y-4">
                            {medicalAdvice.actions.map((action, index) => (
                                <ActionItem 
                                    key={index}
                                    text={action.text} 
                                    urgent={action.urgent}
                                    icon={action.icon}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ icon: Icon, label, message, status }: any) {
    if (!message) return null;
    const isCritical = status === 'critical' || status === 'warning';
    const isWarning = status && status !== 'normal';
    
    const bgClass = isCritical ? 'bg-red-50 border-red-100' : 
                   isWarning ? 'bg-orange-50 border-orange-100' : 
                   'bg-white border-slate-100';
    
    const textClass = isCritical ? 'text-red-900' : 
                     isWarning ? 'text-orange-900' : 
                     'text-slate-600';
    
    const iconClass = isCritical ? 'text-red-500 bg-red-100' : 
                     isWarning ? 'text-orange-500 bg-orange-100' : 
                     'text-blue-500 bg-blue-50';

    return (
        <div className={`${bgClass} border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${iconClass} group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="w-6 h-6" />
                </div>
                {isWarning && <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />}
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">{label}</h4>
            <p className={`text-sm font-medium leading-relaxed ${textClass}`}>{message}</p>
        </div>
    );
}

function ActionItem({ text, urgent, icon: Icon }: any) {
    return (
        <li className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
            urgent ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
        }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                urgent ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm flex-1">{text}</span>
            {urgent && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600">PRIORITAIRE</span>
                </div>
            )}
        </li>
    );
}
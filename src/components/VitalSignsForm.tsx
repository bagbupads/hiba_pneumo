import { useState } from 'react';
import { X, Video, Camera, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VitalSignsService } from '../services/vitalSignsService';
import { AnalysisService } from '../services/analysisService';
import { analyzeVitalSigns } from '../lib/aiAnalysis';
import { Patient } from '../types/firebase';
import MediaViewer from './MediaViewer';

type VitalSignsFormProps = { patient: Patient; onSubmitted?: () => void; };

// --- CONFIGURATION DES ÉTAPES (8 ÉTAPES MAINTENANT) ---
const steps = [
    { id: 1, title: "Température", field: 'temperature', mediaType: 'video', mediaPath: 'media/temperature_final.mp4', unit: '°C', placeholder: '37' },
    { id: 2, title: "Tension Artérielle", field: 'bp', mediaType: 'video', mediaPath: 'media/TA_final.mp4' },
    { id: 3, title: "Fréquence Cardiaque", field: 'heart_rate', mediaType: 'video', mediaPath: 'media/FC_final.mp4', unit: 'bpm', placeholder: '75' },
    { id: 4, title: "Fréquence respiratoire", field: 'respiratory_rate', mediaType: 'video', mediaPath: 'media/FR_final.mp4', unit: '/min', placeholder: '16' },
    { id: 5, title: "Oxygène (SpO₂)", field: 'spo2', mediaType: 'video', mediaPath: 'media/IMG_9714.mov', unit: '%', placeholder: '98' },
    
    // --- NOUVELLE ÉTAPE 6 : Hémoptysie (Sang) avec sa propre photo ---
    { id: 6, title: "Hémoptysie (Sang)", field: 'hemoptysis', mediaType: 'image', mediaPath: 'media/image1.jpeg', mediaTitle: "Guide des quantités" },
    
    // --- NOUVELLE ÉTAPE 7 : Expectorations (Crachats) avec sa propre photo ---
    { id: 7, title: "Expectorations", field: 'sputum', mediaType: 'image', mediaPath: 'media/image2.jpeg', mediaTitle: "Nuancier de couleurs" },
    
    { id: 8, title: "Notes & Ressenti", field: 'notes', mediaType: null },
];

// --- Composant Conteneur d'Étape ---
function StepContainer({ title, children, currentStep, totalSteps, onNext, onPrev, isLast, loading, mediaType, mediaPath, mediaTitle }: any) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Barre de progression */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>Étape {currentStep}</span>
                    <span>{totalSteps} Étapes</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out rounded-full" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                
                <div className="p-8 sm:p-12">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-500 mb-8 font-medium">Veuillez renseigner les informations.</p>

                    {mediaType && (
                        <div className="mb-8">
                            <MediaButton mediaType={mediaType} mediaPath={mediaPath} title={mediaTitle || title} />
                        </div>
                    )}

                    <div className="min-h-[160px] flex flex-col justify-center">
                        {children}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="bg-slate-50/50 p-6 sm:px-12 sm:py-6 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                        onClick={onPrev}
                        disabled={currentStep === 1 || loading}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={isLast ? onNext : onNext}
                        disabled={loading}
                        className={`
                            flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30
                            transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100
                            ${isLast ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}
                        `}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLast ? 'Terminer' : 'Suivant'}
                                {!isLast && <ArrowRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MediaButton({ mediaType, mediaPath, title }: any) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full group bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-white border border-slate-200 hover:border-blue-200 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md text-left"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {mediaType === 'video' ? <Video className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-sm">Besoin d'aide ?</p>
                    <p className="text-xs text-slate-500">Voir : {title}</p>
                </div>
                <div className="ml-auto bg-white p-2 rounded-full shadow-sm text-slate-400 group-hover:text-blue-500">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </button>
            <MediaViewer isOpen={isOpen} onClose={() => setIsOpen(false)} type={mediaType} path={mediaPath} title={title} />
        </>
    )
}

// Composant Input Géant SANS BOUTONS +/-
const InputField = ({ value, onChange, unit, placeholder, label }: any) => (
    <div className="flex flex-col items-center justify-center w-full animate-in zoom-in-95 duration-500 py-10">
        {label && <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{label}</label>}
        <div className="relative flex items-baseline justify-center group w-full">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full text-center text-7xl sm:text-8xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-200 transition-all caret-blue-500 outline-none"
                autoFocus
            />
            {unit && <span className="text-2xl sm:text-3xl font-bold text-slate-400 ml-2 self-start mt-4">{unit}</span>}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-slate-100 rounded-full group-focus-within:w-1/2 group-focus-within:bg-blue-500 transition-all duration-500 ease-out" />
        </div>
    </div>
);

// Composant Bouton OUI/NON Géant
const YesNoToggle = ({ value, onChange, label }: any) => (
    <div className="w-full">
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">{label}</label>
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => onChange(false)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 font-bold text-lg flex flex-col items-center justify-center gap-2 ${
                    value === false 
                    ? 'bg-slate-800 border-slate-800 text-white shadow-xl scale-[1.02]' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
            >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${value === false ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                    {value === false && <Check className="w-4 h-4 text-white" />}
                </div>
                NON
            </button>
            <button
                onClick={() => onChange(true)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 font-bold text-lg flex flex-col items-center justify-center gap-2 ${
                    value === true 
                    ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-400'
                }`}
            >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${value === true ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                    {value === true && <AlertCircle className="w-4 h-4 text-white" />}
                </div>
                OUI
            </button>
        </div>
    </div>
);

export default function VitalSignsForm({ patient, onSubmitted }: VitalSignsFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        temperature: '', systolic_bp: '', diastolic_bp: '', heart_rate: '', respiratory_rate: '', 
        spo2: '', spo2_on_oxygen: false, oxygen_flow_rate: '', 
        hemoptysis_present: false, hemoptysis_quantity: '', sputum_present: false, sputum_aspect: '', sputum_color: '', notes: '',
    });

    const handleNext = () => currentStep < steps.length ? setCurrentStep(prev => prev + 1) : handleSubmit();
    const handlePrev = () => currentStep > 1 && setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const vitalSignsData: any = { 
                patientId: patient.id, createdBy: user!.uid, created_at: new Date(),
                ...formData,
                temperature: Number(formData.temperature) || null,
                systolic_bp: Number(formData.systolic_bp) || null,
                diastolic_bp: Number(formData.diastolic_bp) || null,
                heart_rate: Number(formData.heart_rate) || null,
                respiratory_rate: Number(formData.respiratory_rate) || null,
                spo2: Number(formData.spo2) || null,
                oxygen_flow_rate: Number(formData.oxygen_flow_rate) || null
            };

            const vitalSignsId = await VitalSignsService.createVitalSigns(vitalSignsData);
            const previousData = await VitalSignsService.getLatestVitalSigns(patient.id, 7);
            const currentVitalSigns = await VitalSignsService.getVitalSignsById(vitalSignsId);
            
            if (currentVitalSigns) {
                const analysis = analyzeVitalSigns(currentVitalSigns, previousData);
                await AnalysisService.createAnalysis({ vitalSignsId, patientId: patient.id, ...analysis });
            }
            onSubmitted?.();
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <InputField value={formData.temperature} onChange={(v:any) => setFormData({...formData, temperature: v})} unit="°C" placeholder="37" />;
            case 2: return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <InputField label="Systolique (Haut)" value={formData.systolic_bp} onChange={(v:any) => setFormData({...formData, systolic_bp: v})} unit="mmHg" placeholder="120" />
                    <InputField label="Diastolique (Bas)" value={formData.diastolic_bp} onChange={(v:any) => setFormData({...formData, diastolic_bp: v})} unit="mmHg" placeholder="80" />
                </div>
            );
            case 3: return <InputField value={formData.heart_rate} onChange={(v:any) => setFormData({...formData, heart_rate: v})} unit="bpm" placeholder="75" />;
            case 4: return <InputField value={formData.respiratory_rate} onChange={(v:any) => setFormData({...formData, respiratory_rate: v})} unit="/min" placeholder="16" />;
            case 5: return (
                <div className="space-y-10 w-full max-w-md mx-auto">
                    <InputField value={formData.spo2} onChange={(v:any) => setFormData({...formData, spo2: v})} unit="%" placeholder="98" />
                    <div className="bg-slate-50 p-6 rounded-2xl">
                        <label className="flex items-center gap-4 cursor-pointer">
                            <input type="checkbox" checked={formData.spo2_on_oxygen} onChange={e => setFormData({...formData, spo2_on_oxygen: e.target.checked})} className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="font-bold text-slate-700 text-lg">Je suis sous oxygène</span>
                        </label>
                        {formData.spo2_on_oxygen && (
                            <div className="mt-6 animate-in slide-in-from-top-2">
                                <InputField label="Débit" value={formData.oxygen_flow_rate} onChange={(v:any) => setFormData({...formData, oxygen_flow_rate: v})} unit="L/min" placeholder="2" />
                            </div>
                        )}
                    </div>
                </div>
            );
            // ÉTAPE 6 : HÉMOPTYSIE (SÉPARÉE)
            case 6: return (
                <div className="w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <YesNoToggle 
                        label="Avez-vous craché du sang ?" 
                        value={formData.hemoptysis_present} 
                        onChange={(v: boolean) => setFormData({...formData, hemoptysis_present: v})} 
                    />
                    
                    {formData.hemoptysis_present && (
                        <div className="animate-in slide-in-from-bottom-2">
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Quantité</label>
                            <select 
                                className="w-full p-4 text-lg rounded-xl border-2 border-red-100 bg-white focus:ring-red-500 focus:border-red-500 text-slate-700 shadow-sm" 
                                value={formData.hemoptysis_quantity} 
                                onChange={(e) => setFormData({...formData, hemoptysis_quantity: e.target.value})}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="stries">Stries (Traces simples)</option>
                                <option value="cuilleree">Volume d'une cuillère</option>
                                <option value="abondante">Abondante (+ d'une cuillère)</option>
                            </select>
                        </div>
                    )}
                </div>
            );
            // ÉTAPE 7 : EXPECTORATIONS (SÉPARÉE)
            case 7: return (
                <div className="w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <YesNoToggle 
                        label="Avez-vous des crachats ?" 
                        value={formData.sputum_present} 
                        onChange={(v: boolean) => setFormData({...formData, sputum_present: v})} 
                    />

                    {formData.sputum_present && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Couleur</label>
                                <select 
                                    className="w-full p-4 rounded-xl border-2 border-amber-100 bg-white text-slate-700 text-lg shadow-sm" 
                                    value={formData.sputum_color} 
                                    onChange={(e) => setFormData({...formData, sputum_color: e.target.value})}
                                >
                                    <option value="">...</option>
                                    <option value="transparente">Claire / Transparente</option>
                                    <option value="blanc">Blanche / Mousseuse</option>
                                    <option value="jaunatre">Jaune / Purulente</option>
                                    <option value="vert">Verte</option>
                                    <option value="marron">Marron</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aspect</label>
                                <select 
                                    className="w-full p-4 rounded-xl border-2 border-amber-100 bg-white text-slate-700 text-lg shadow-sm" 
                                    value={formData.sputum_aspect} 
                                    onChange={(e) => setFormData({...formData, sputum_aspect: e.target.value})}
                                >
                                    <option value="">...</option>
                                    <option value="fluide">Fluide</option>
                                    <option value="epais">Épaisse</option>
                                    <option value="collant">Collante</option>
                                </select>
                            </div>
                         </div>
                    )}
                </div>
            );
            case 8: return (
                <textarea 
                    className="w-full h-48 p-6 rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 resize-none text-xl leading-relaxed"
                    placeholder="Comment vous sentez-vous aujourd'hui ? (Fatigue, toux, sommeil...)"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
            );
            default: return null;
        }
    }

    const currentConfig = steps[currentStep - 1];

    return (
        <StepContainer 
            currentStep={currentStep} totalSteps={steps.length} 
            title={currentConfig.title} mediaType={currentConfig.mediaType} mediaPath={currentConfig.mediaPath} mediaTitle={currentConfig.title}
            onNext={handleNext} onPrev={handlePrev} isLast={currentStep === steps.length} loading={loading}
        >
            {renderStepContent()}
        </StepContainer>
    );
}
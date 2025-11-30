import { Calendar, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VitalSigns } from '../types/firebase';
import { VitalSignsService } from '../services/vitalSignsService';

export default function HistoryView({ patient }: { patient: any }) {
    const [history, setHistory] = useState<VitalSigns[]>([]);
    
    useEffect(() => {
        if(patient?.id) VitalSignsService.getLatestVitalSigns(patient.id, 30).then(setHistory);
    }, [patient]);

    if (history.length === 0) return (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucun historique disponible.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-8 border-b border-slate-100">
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    Historique Médical
                </h2>
                <p className="text-slate-500 mt-2 ml-16">
                    Suivi complet de vos 30 derniers jours.
                </p>
            </div>

            <div className="divide-y divide-slate-100">
                {history.map((entry) => (
                    <HistoryItem key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    );
}

function HistoryItem({ entry }: { entry: VitalSigns }) {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(entry.recorded_at);
    
    const hasWarning = (entry.temperature && entry.temperature > 38) || (entry.spo2 && entry.spo2 < 95);
    const statusColor = hasWarning ? 'bg-red-500' : 'bg-emerald-500';

    return (
        <div className="group transition-all hover:bg-slate-50">
            <div 
                className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row gap-8 items-start sm:items-center"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Date Badge */}
                <div className="flex items-center gap-5 min-w-[180px]">
                    <div className={`w-1.5 h-16 rounded-full ${statusColor}`} />
                    <div>
                        <div className="text-3xl font-black text-slate-800 leading-none">
                            {date.getDate()}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            {date.toLocaleDateString('fr-FR', { month: 'long' })}
                        </div>
                        <div className="text-xs text-slate-500 mt-1.5 font-bold bg-slate-100 px-2 py-1 rounded-md w-fit">
                            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <MetricBadge label="Temp" value={entry.temperature} unit="°C" />
                    <MetricBadge label="SpO2" value={entry.spo2} unit="%" color={entry.spo2 && entry.spo2 < 95 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'} />
                    <MetricBadge label="Pouls" value={entry.heart_rate} unit="bpm" />
                    <MetricBadge label="Tension" value={entry.systolic_bp} unit="mmHg" />
                </div>

                <div className="hidden sm:block text-slate-300 group-hover:text-blue-500 transition-colors">
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>

            {expanded && (
                <div className="px-6 pb-8 pl-8 sm:pl-32 animate-in slide-in-from-top-2">
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-inner">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> 
                            Détails & Observations
                        </h4>
                        
                        <div className="grid sm:grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-slate-400 font-bold uppercase text-xs mb-1">Respiration</p>
                                <p className="text-slate-700 font-medium text-lg">{entry.respiratory_rate || '-'} <span className="text-xs">/min</span></p>
                            </div>
                            
                            {(entry.hemoptysis_present || entry.sputum_present) && (
                                <div className="col-span-2 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-900">
                                    <strong>Symptômes signalés : </strong>
                                    {entry.hemoptysis_present && "Hémoptysie. "}
                                    {entry.sputum_present && "Expectorations."}
                                </div>
                            )}

                            {entry.notes && (
                                <div className="col-span-2">
                                    <p className="text-slate-400 font-bold uppercase text-xs mb-1">Note du patient</p>
                                    <p className="text-slate-600 italic text-lg">"{entry.notes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricBadge({ label, value, unit, color = "text-slate-700 bg-slate-50" }: any) {
    return (
        <div className={`rounded-2xl p-4 border border-slate-100 ${color} flex flex-col justify-center`}>
            <span className="text-[10px] font-bold uppercase opacity-60 mb-1">{label}</span>
            <span className="text-xl font-black leading-none">{value || '--'} <small className="text-xs font-bold opacity-70">{unit}</small></span>
        </div>
    );
}
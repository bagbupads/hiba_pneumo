import { VitalSigns, AIAnalysis } from '../types/firebase';

export const analyzeVitalSigns = (
  current: VitalSigns, 
  previousHistory: VitalSigns[]
): Omit<AIAnalysis, 'id' | 'vitalSignsId' | 'patientId' | 'created_at'> => {
  
  let score = 100;
  let status: 'green' | 'orange' | 'red' = 'green';
  let criticalAlerts: string[] = [];
  let warnings: string[] = [];

  const previous = previousHistory.length > 0 ? previousHistory[0] : null;

  // --- 1. ANALYSE TEMPÉRATURE ---
  let tempMsg = null;
  let tempStatus = 'normal';
  
  if (current.temperature) {
    if (current.temperature > 39.5 || current.temperature < 35) {
      tempStatus = 'critical';
      tempMsg = `Température critique (${current.temperature}°C) - Urgence médicale`;
      score -= 30;
      criticalAlerts.push(`Température ${current.temperature}°C`);
      status = 'red';
    } else if (current.temperature > 38.5 || current.temperature < 36) {
      tempStatus = 'warning';
      tempMsg = `Température anormale (${current.temperature}°C) - Surveillance requise`;
      score -= 15;
      warnings.push(`Température ${current.temperature}°C`);
      if (status !== 'red') status = 'orange';
    } else if (current.temperature > 37.5) {
      tempStatus = 'high';
      tempMsg = `Légère fièvre (${current.temperature}°C)`;
      score -= 5;
    } else {
      tempMsg = `Température normale (${current.temperature}°C)`;
    }
  }

  // --- 2. ANALYSE FRÉQUENCE CARDIAQUE ---
  let heartRateMsg = null;
  let heartRateStatus = 'normal';
  
  if (current.heart_rate) {
    if (current.heart_rate > 140 || current.heart_rate < 40) {
      heartRateStatus = 'critical';
      heartRateMsg = `Fréquence cardiaque critique (${current.heart_rate} bpm) - Urgence`;
      score -= 30;
      criticalAlerts.push(`FC ${current.heart_rate} bpm`);
      status = 'red';
    } else if (current.heart_rate > 120 || current.heart_rate < 50) {
      heartRateStatus = 'warning';
      heartRateMsg = `Fréquence cardiaque anormale (${current.heart_rate} bpm)`;
      score -= 15;
      warnings.push(`FC ${current.heart_rate} bpm`);
      if (status !== 'red') status = 'orange';
    } else if (current.heart_rate > 100 || current.heart_rate < 60) {
      heartRateStatus = 'high';
      heartRateMsg = `Fréquence cardiaque élevée (${current.heart_rate} bpm)`;
      score -= 5;
    } else {
      heartRateMsg = `Fréquence cardiaque normale (${current.heart_rate} bpm)`;
    }
  }

  // --- 3. ANALYSE SATURATION (SpO2) ---
  let spo2Msg = null;
  let spo2Status = 'normal';
  
  if (current.spo2) {
    if (current.spo2 < 90) {
      spo2Status = 'critical';
      spo2Msg = `SpO₂ critique (${current.spo2}%) - Oxygénation insuffisante`;
      score -= 35;
      criticalAlerts.push(`SpO2 ${current.spo2}%`);
      status = 'red';
    } else if (current.spo2 < 94) {
      spo2Status = 'warning';
      spo2Msg = `SpO₂ basse (${current.spo2}%) - Surveillance nécessaire`;
      score -= 20;
      warnings.push(`SpO2 ${current.spo2}%`);
      if (status !== 'red') status = 'orange';
    } else if (current.spo2 < 96) {
      spo2Status = 'low';
      spo2Msg = `SpO₂ légèrement basse (${current.spo2}%)`;
      score -= 8;
    } else {
      spo2Msg = `Oxygénation excellente (${current.spo2}%)`;
      score += 5; // Bonus pour bonne oxygénation
    }
  }

  // --- 4. ANALYSE TENSION ARTÉRIELLE ---
  let bpMsg = null;
  let bpStatus = 'normal';
  
  if (current.systolic_bp && current.diastolic_bp) {
    const systolic = current.systolic_bp;
    const diastolic = current.diastolic_bp;
    
    if (systolic > 180 || systolic < 90 || diastolic > 120 || diastolic < 50) {
      bpStatus = 'critical';
      bpMsg = `Tension critique (${systolic}/${diastolic} mmHg)`;
      score -= 25;
      criticalAlerts.push(`TA ${systolic}/${diastolic} mmHg`);
      status = 'red';
    } else if (systolic > 160 || systolic < 100 || diastolic > 100 || diastolic < 60) {
      bpStatus = 'warning';
      bpMsg = `Tension anormale (${systolic}/${diastolic} mmHg)`;
      score -= 15;
      warnings.push(`TA ${systolic}/${diastolic} mmHg`);
      if (status !== 'red') status = 'orange';
    } else if (systolic > 140 || diastolic > 90) {
      bpStatus = 'high';
      bpMsg = `Tension élevée (${systolic}/${diastolic} mmHg)`;
      score -= 8;
    } else {
      bpMsg = `Tension normale (${systolic}/${diastolic} mmHg)`;
    }
  }

  // --- 5. ANALYSE RESPIRATION ---
  let respiratoryMsg = null;
  let respiratoryStatus = 'normal';
  
  if (current.respiratory_rate) {
    if (current.respiratory_rate > 30 || current.respiratory_rate < 8) {
      respiratoryStatus = 'critical';
      respiratoryMsg = `Fréquence respiratoire critique (${current.respiratory_rate}/min)`;
      score -= 20;
      criticalAlerts.push(`FR ${current.respiratory_rate}/min`);
      status = 'red';
    } else if (current.respiratory_rate > 25 || current.respiratory_rate < 12) {
      respiratoryStatus = 'warning';
      respiratoryMsg = `Fréquence respiratoire anormale (${current.respiratory_rate}/min)`;
      score -= 12;
      warnings.push(`FR ${current.respiratory_rate}/min`);
      if (status !== 'red') status = 'orange';
    } else {
      respiratoryMsg = `Respiration normale (${current.respiratory_rate}/min)`;
    }
  }

  // --- 6. HÉMOPTYSIE & SYMPTÔMES ---
  let hemoptysisWarning = null;
  if (current.hemoptysis_present) {
    score -= 40;
    status = 'red';
    hemoptysisWarning = "ALERTE : Présence de sang dans les expectorations.";
    criticalAlerts.push("Hémoptysie");
  }

  // --- GÉNÉRATION DU RÉSUMÉ ---
  score = Math.max(0, Math.min(100, score));

  let dailySummary = "Vos paramètres vitaux sont dans les normes.";
  
  if (criticalAlerts.length > 0) {
    dailySummary = `URGENCE : ${criticalAlerts.join(', ')}. Consultation médicale immédiate nécessaire.`;
  } else if (warnings.length > 0) {
    dailySummary = `Vigilance : ${warnings.join(', ')}. Surveillance médicale recommandée.`;
  } else if (score >= 90) {
    dailySummary = "Excellent état général. Paramètres vitaux stables.";
  } else if (score >= 70) {
    dailySummary = "État général correct. Quelques variations mineures.";
  }

  return {
    health_score: Math.round(score),
    overall_status: status,
    daily_summary: dailySummary,
    temperature_message: tempMsg,
    temperature_status: tempStatus,
    bp_message: bpMsg,
    bp_status: bpStatus,
    heart_rate_message: heartRateMsg,
    heart_rate_status: heartRateStatus,
    respiratory_message: respiratoryMsg,
    respiratory_status: respiratoryStatus,
    spo2_message: spo2Msg,
    spo2_status: spo2Status,
    sputum_analysis: current.sputum_present ? "Présence d'expectorations." : null,
    hemoptysis_warning: hemoptysisWarning
  };
};
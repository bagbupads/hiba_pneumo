export interface User {
  id: string;
  email: string;
  userType: 'patient' | 'doctor';
  createdAt: Date;
}

export interface Patient extends User {
  userType: 'patient';
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  assignedDoctor: 'allali' | 'kbida' | 'hlawa';
}

export interface Doctor extends User {
  userType: 'doctor';
  fullName: string;
  specialty: string;
  doctorId: 'allali' | 'kbida' | 'hlawa';
}

export interface VitalSigns {
  id: string;
  patientId: string;
  temperature?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  spo2?: number;
  spo2_on_oxygen?: boolean;
  oxygen_flow_rate?: number;
  hemoptysis_present?: boolean;
  hemoptysis_quantity?: string;
  sputum_present?: boolean;
  sputum_aspect?: string;
  sputum_color?: string;
  notes?: string;
  recorded_at: Date;
  createdBy: string;
}

export interface AIAnalysis {
  id: string;
  vitalSignsId: string;
  patientId: string;
  health_score: number;
  overall_status: 'green' | 'orange' | 'red';
  daily_summary: string;
  temperature_status?: string;
  temperature_message?: string;
  bp_status?: string;
  bp_message?: string;
  heart_rate_status?: string;
  heart_rate_message?: string;
  respiratory_status?: string;
  respiratory_message?: string;
  spo2_status?: string;
  spo2_message?: string;
  sputum_analysis?: string;
  hemoptysis_warning?: string;
  created_at: Date;
}
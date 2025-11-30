import { AuthService } from '../services/authService';

// Script pour créer les comptes docteurs initiaux
export async function initializeDoctors() {
  const doctors = [
    {
      email: 'allali@meditrack.com',
      password: 'Allali123',
      fullName: 'Allali',
      specialty: 'Médecine Générale',
      doctorId: 'allali' as const
    },
    {
      email: 'kbida@meditrack.com',
      password: 'Kbida123',
      fullName: 'Kbida',
      specialty: 'Cardiologie',
      doctorId: 'kbida' as const
    },
    {
      email: 'hlawa@meditrack.com',
      password: 'Hlawa123',
      fullName: 'Hlawa',
      specialty: 'Pneumologie',
      doctorId: 'hlawa' as const
    }
  ];

  for (const doctor of doctors) {
    try {
      await AuthService.registerDoctor(doctor.email, doctor.password, doctor);
      console.log(`Docteur ${doctor.fullName} créé avec succès`);
    } catch (error) {
      console.log(`Docteur ${doctor.fullName} existe déjà`);
    }
  }
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  birthDate: string
  gender: 'female' | 'male'
  address: string
  selectedTreatments: string[]
  treatmentNotes: string
  beforePhotos: string[]
  afterPhotos: string[]
  allergies: string
  medications: string
  medicalHistory: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface PatientState {
  patients: Patient[]
  isLoading: boolean
  error: string | null
}

interface PatientActions {
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  getPatient: (id: string) => Patient | undefined
  clearError: () => void
}

type PatientStore = PatientState & PatientActions

export const usePatientStore = create<PatientStore>()(
  persist(
    (set, get) => ({
      patients: [],
      isLoading: false,
      error: null,

      addPatient: (patientData) => {
        const newPatient: Patient = {
          ...patientData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          patients: [...state.patients, newPatient],
        }))
      },

      updatePatient: (id, updates) => {
        set((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === id
              ? { ...patient, ...updates, updatedAt: new Date().toISOString() }
              : patient
          ),
        }))
      },

      deletePatient: (id) => {
        set((state) => {
          // Hasta silinmeden önce, o hastaya ait randevuları da sil
          const patientToDelete = state.patients.find(patient => patient.id === id)
          
          if (patientToDelete) {
            // LocalStorage'dan appointment store'u al ve güncelle
            try {
              const appointmentStorage = localStorage.getItem('appointment-storage')
              if (appointmentStorage) {
                const appointmentData = JSON.parse(appointmentStorage)
                if (appointmentData.state && appointmentData.state.appointments) {
                  // Bu hastaya ait randevuları filtrele
                  const updatedAppointments = appointmentData.state.appointments.filter(
                    (apt: any) => apt.patientId !== id
                  )
                  
                  // LocalStorage'ı güncelle
                  localStorage.setItem('appointment-storage', JSON.stringify({
                    ...appointmentData,
                    state: {
                      ...appointmentData.state,
                      appointments: updatedAppointments
                    }
                  }))
                  
                  console.log(`Hasta ${patientToDelete.name} silindi. ${appointmentData.state.appointments.length - updatedAppointments.length} randevu da silindi.`)
                }
              }
            } catch (error) {
              console.warn('Randevular silinirken hata oluştu:', error)
            }
          }
          
          // Hastayı sil
          return {
            patients: state.patients.filter((patient) => patient.id !== id),
          }
        })
      },

      getPatient: (id) => {
        return get().patients.find((patient) => patient.id === id)
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'patient-storage',
      partialize: (state) => ({ patients: state.patients }),
    }
  )
)

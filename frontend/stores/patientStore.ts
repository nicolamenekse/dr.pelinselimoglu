import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PatientPhoto {
  url: string
  treatments: string[]
  type: 'before' | 'after'
  uploadedAt: string
}

export interface Patient {
  id: string
  name: string
  tcId: string
  phone: string
  email: string
  birthDate: string
  gender: 'female' | 'male'
  address: string
  selectedTreatments: string[]
  treatmentNotes: string
  beforePhotos: string[]
  afterPhotos: string[]
  photos: PatientPhoto[]
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
  getAllPatients: () => Patient[]
  addPatientPhoto: (patientId: string, photo: Omit<PatientPhoto, 'uploadedAt'>) => void
  removePatientPhoto: (patientId: string, photoUrl: string) => void
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
          photos: patientData.photos || [],
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
              ? { 
                  ...patient, 
                  ...updates, 
                  photos: updates.photos || patient.photos || [],
                  updatedAt: new Date().toISOString() 
                }
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
        const patient = get().patients.find((patient) => patient.id === id)
        // Ensure all fields exist for backward compatibility
        if (patient) {
          return {
            ...patient,
            tcId: patient.tcId || '',
            photos: patient.photos || [],
            selectedTreatments: patient.selectedTreatments || [],
            treatmentNotes: patient.treatmentNotes || '',
            beforePhotos: patient.beforePhotos || [],
            afterPhotos: patient.afterPhotos || [],
            allergies: patient.allergies || '',
            medications: patient.medications || '',
            medicalHistory: patient.medicalHistory || '',
            notes: patient.notes || ''
          }
        }
        return patient
      },

      getAllPatients: () => {
        return get().patients.map(patient => ({
          ...patient,
          tcId: patient.tcId || '',
          photos: patient.photos || [],
          selectedTreatments: patient.selectedTreatments || [],
          treatmentNotes: patient.treatmentNotes || '',
          beforePhotos: patient.beforePhotos || [],
          afterPhotos: patient.afterPhotos || [],
          allergies: patient.allergies || '',
          medications: patient.medications || '',
          medicalHistory: patient.medicalHistory || '',
          notes: patient.notes || ''
        }))
      },

      addPatientPhoto: (patientId, photoData) => {
        const newPhoto: PatientPhoto = {
          ...photoData,
          uploadedAt: new Date().toISOString()
        }
        
        set((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === patientId
              ? {
                  ...patient,
                  photos: [...(patient.photos || []), newPhoto],
                  updatedAt: new Date().toISOString()
                }
              : patient
          ),
        }))
      },

      removePatientPhoto: (patientId, photoUrl) => {
        set((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === patientId
              ? {
                  ...patient,
                  photos: (patient.photos || []).filter(photo => photo.url !== photoUrl),
                  updatedAt: new Date().toISOString()
                }
              : patient
          ),
        }))
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'patient-storage',
      partialize: (state) => ({ patients: state.patients }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          const state = persistedState as { patients: Patient[] }
          return {
            patients: state.patients.map(patient => ({
              ...patient,
              tcId: patient.tcId || '',
              photos: patient.photos || [],
              selectedTreatments: patient.selectedTreatments || [],
              treatmentNotes: patient.treatmentNotes || '',
              beforePhotos: patient.beforePhotos || [],
              afterPhotos: patient.afterPhotos || [],
              allergies: patient.allergies || '',
              medications: patient.medications || '',
              medicalHistory: patient.medicalHistory || '',
              notes: patient.notes || ''
            }))
          }
        }
        return persistedState
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const updatedPatients = state.patients.map(patient => ({
            ...patient,
            tcId: patient.tcId || '',
            photos: patient.photos || [],
            selectedTreatments: patient.selectedTreatments || [],
            treatmentNotes: patient.treatmentNotes || '',
            beforePhotos: patient.beforePhotos || [],
            afterPhotos: patient.afterPhotos || [],
            allergies: patient.allergies || '',
            medications: patient.medications || '',
            medicalHistory: patient.medicalHistory || '',
            notes: patient.notes || ''
          }))
          state.patients = updatedPatients
        }
      }
    }
  )
)

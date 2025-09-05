import { create } from 'zustand'
import { api, Patient, PatientPhoto } from '@/lib/api'

interface PatientState {
  patients: Patient[]
  isLoading: boolean
  error: string | null
}

interface PatientActions {
  // Async operations
  fetchPatients: () => Promise<void>
  fetchPatient: (id: string) => Promise<Patient | null>
  addPatient: (patient: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<boolean>
  deletePatient: (id: string) => Promise<boolean>
  searchPatients: (query: string) => Promise<Patient[]>
  
  // Photo operations
  uploadPhotos: (patientId: string, files: File[], treatments: string, type: 'before' | 'after') => Promise<boolean>
  deletePhoto: (photoId: string) => Promise<boolean>
  
  // Sync operations
  getPatient: (id: string) => Patient | undefined
  getAllPatients: () => Patient[]
  clearError: () => void
}

type PatientStore = PatientState & PatientActions

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  // Fetch all patients from API
  fetchPatients: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.getPatients()
      if (response.success && response.data) {
        set({ patients: response.data, isLoading: false })
      } else {
        set({ error: response.message || 'Hastalar yüklenemedi', isLoading: false })
      }
    } catch (error) {
      set({ error: 'Hastalar yüklenirken hata oluştu', isLoading: false })
    }
  },

  // Fetch single patient from API
  fetchPatient: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.getPatient(id)
      if (response.success && response.data) {
        // Update patient in local state
        set((state) => ({
          patients: state.patients.map(p => p._id === id ? response.data! : p)
        }))
        set({ isLoading: false })
        return response.data
      } else {
        set({ error: response.message || 'Hasta bulunamadı', isLoading: false })
        return null
      }
    } catch (error) {
      set({ error: 'Hasta yüklenirken hata oluştu', isLoading: false })
      return null
    }
  },

  // Add new patient via API
  addPatient: async (patientData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.createPatient(patientData)
      if (response.success && response.data) {
        set((state) => ({
          patients: [response.data!, ...state.patients],
          isLoading: false
        }))
        return true
      } else {
        set({ error: response.message || 'Hasta oluşturulamadı', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Hasta oluşturulurken hata oluştu', isLoading: false })
      return false
    }
  },

  // Update patient via API
  updatePatient: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.updatePatient(id, updates)
      if (response.success && response.data) {
        set((state) => ({
          patients: state.patients.map(patient =>
            patient._id === id ? response.data! : patient
          ),
          isLoading: false
        }))
        return true
      } else {
        set({ error: response.message || 'Hasta güncellenemedi', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Hasta güncellenirken hata oluştu', isLoading: false })
      return false
    }
  },

  // Delete patient via API
  deletePatient: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.deletePatient(id)
      if (response.success) {
        set((state) => ({
          patients: state.patients.filter(patient => patient._id !== id),
          isLoading: false
        }))
        return true
      } else {
        set({ error: response.message || 'Hasta silinemedi', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Hasta silinirken hata oluştu', isLoading: false })
      return false
    }
  },

  // Search patients via API
  searchPatients: async (query) => {
    try {
      const response = await api.searchPatients(query)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      set({ error: 'Arama yapılırken hata oluştu' })
      return []
    }
  },

  // Upload photos via API
  uploadPhotos: async (patientId, files, treatments, type) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.uploadPhotos(patientId, files, treatments, type)
      if (response.success) {
        // Refresh patient data to get updated photos
        await get().fetchPatient(patientId)
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.message || 'Fotoğraflar yüklenemedi', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Fotoğraflar yüklenirken hata oluştu', isLoading: false })
      return false
    }
  },

  // Delete photo via API
  deletePhoto: async (photoId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.deletePhoto(photoId)
      if (response.success) {
        set({ isLoading: false })
        return true
      } else {
        set({ error: response.message || 'Fotoğraf silinemedi', isLoading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Fotoğraf silinirken hata oluştu', isLoading: false })
      return false
    }
  },

  // Sync operations (for backward compatibility)
  getPatient: (id) => {
    return get().patients.find(patient => patient._id === id)
  },

  getAllPatients: () => {
    return get().patients
  },

  clearError: () => {
    set({ error: null })
  }
}))

// Export types for compatibility
export type { Patient, PatientPhoto }
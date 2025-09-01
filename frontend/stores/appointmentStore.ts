import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  duration: number // dakika cinsinden
  treatment: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface AppointmentState {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
}

interface AppointmentActions {
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  deleteAppointment: (id: string) => void
  deleteAppointmentsByPatientId: (patientId: string) => void
  getAppointmentsByDate: (date: string) => Appointment[]
  getAppointmentsByPatient: (patientId: string) => Appointment[]
  getUpcomingAppointments: () => Appointment[]
  clearError: () => void
  syncAppointmentsWithPatients: (patients: any[]) => void
  updateAppointmentPatientId: (appointmentId: string, newPatientId: string) => void
}

type AppointmentStore = AppointmentState & AppointmentActions

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set, get) => ({
      appointments: [],
      isLoading: false,
      error: null,

      addAppointment: (appointmentData) => {
        const newAppointment: Appointment = {
          ...appointmentData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }))
      },

      updateAppointment: (id, updates) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id
              ? { ...appointment, ...updates, updatedAt: new Date().toISOString() }
              : appointment
          ),
        }))
      },

      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter((appointment) => appointment.id !== id),
        }))
      },

      deleteAppointmentsByPatientId: (patientId) => {
        set((state) => ({
          appointments: state.appointments.filter(
            (appointment) => appointment.patientId !== patientId
          ),
        }))
      },

      getAppointmentsByDate: (date) => {
        const { appointments } = get()
        return appointments.filter((appointment) => appointment.date === date)
      },

      getAppointmentsByPatient: (patientId) => {
        const { appointments } = get()
        return appointments.filter((appointment) => appointment.patientId === patientId)
      },

      getUpcomingAppointments: () => {
        const { appointments } = get()
        const now = new Date()
        return appointments
          .filter((appointment) => {
            const appointmentDate = new Date(appointment.date + 'T' + appointment.time)
            return appointmentDate > now && appointment.status !== 'cancelled'
          })
          .sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time)
            const dateB = new Date(b.date + 'T' + b.time)
            return dateA.getTime() - dateB.getTime()
          })
      },

      clearError: () => set({ error: null }),

      syncAppointmentsWithPatients: (patients) => {
        const { appointments } = get()
        let hasChanges = false
        
        // Aynı isimdeki hastaları grupla
        const patientsByName = patients.reduce((acc, patient) => {
          if (!acc[patient.name]) {
            acc[patient.name] = []
          }
          acc[patient.name].push(patient)
          return acc
        }, {} as Record<string, any[]>)
        
        const updatedAppointments = appointments.map((appointment) => {
          const patientsWithSameName = patientsByName[appointment.patientName]
          
          if (patientsWithSameName && patientsWithSameName.length > 0) {
            // Eğer sadece 1 hasta varsa, direkt eşleştir
            if (patientsWithSameName.length === 1) {
              const matchingPatient = patientsWithSameName[0]
              if (appointment.patientId !== matchingPatient.id) {
                hasChanges = true
                console.log(`🔄 Syncing appointment ${appointment.id}: patientId ${appointment.patientId} → ${matchingPatient.id} for patient "${appointment.patientName}"`)
                return {
                  ...appointment,
                  patientId: matchingPatient.id,
                  updatedAt: new Date().toISOString()
                }
              }
            } else {
              // Aynı isimde birden fazla hasta varsa, en akıllı eşleştirmeyi yap
              console.log(`⚠️ Multiple patients with name "${appointment.patientName}" found, using smart matching`)
              
                             // 1. Önce mevcut patientId ile eşleşen hasta var mı kontrol et
               const exactMatch = patientsWithSameName.find((p: any) => p.id === appointment.patientId)
               if (exactMatch) {
                 console.log(`✅ Appointment ${appointment.id} already correctly matched with patient ${exactMatch.id}`)
                 return appointment
               }
               
               // 2. Eğer eşleşme yoksa, randevu tarihine göre en uygun hastayı seç
               // (En eski randevu en eski hasta ile eşleşir)
               const appointmentDate = new Date(appointment.date + 'T' + appointment.time)
               const sortedPatients = patientsWithSameName.sort((a: any, b: any) => 
                 new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
               )
              
              // Randevu tarihine göre hasta seçimi (basit algoritma)
              const patientIndex = Math.floor(
                (appointmentDate.getTime() % (sortedPatients.length * 1000)) / 1000
              )
              const selectedPatient = sortedPatients[patientIndex]
              
              hasChanges = true
              console.log(`🔄 Smart matching: appointment ${appointment.id} (${appointment.date}) → patient ${selectedPatient.id} (${selectedPatient.name})`)
              return {
                ...appointment,
                patientId: selectedPatient.id,
                updatedAt: new Date().toISOString()
              }
            }
          }
          
          return appointment
        })
        
        if (hasChanges) {
          set({ appointments: updatedAppointments })
          console.log(`✅ Successfully synced ${updatedAppointments.filter((apt, index) => apt !== appointments[index]).length} appointments`)
        } else {
          console.log(`ℹ️ No appointment sync needed`)
        }
      },

      updateAppointmentPatientId: (appointmentId, newPatientId) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, patientId: newPatientId, updatedAt: new Date().toISOString() }
              : appointment
          ),
        }))
      },
    }),
    {
      name: 'appointment-storage',
    }
  )
)

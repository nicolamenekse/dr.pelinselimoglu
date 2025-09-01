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
    }),
    {
      name: 'appointment-storage',
    }
  )
)

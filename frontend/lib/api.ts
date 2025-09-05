const API_BASE_URL = 'http://localhost:5000/api';

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

// Patient interfaces
export interface PatientPhoto {
  url: string;
  treatments: string[];
  type: 'before' | 'after';
  uploadedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  tcId: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'female' | 'male';
  address: string;
  selectedTreatments: string[];
  treatmentNotes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  photos: PatientPhoto[];
  allergies: string;
  medications: string;
  medicalHistory: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Auth helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// API calls
export const api = {
  // Patient operations
  async getPatients(): Promise<ApiResponse<Patient[]>> {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createPatient(patient: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Patient>> {
    console.log('Creating patient with data:', patient);
    console.log('Auth headers:', getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patient)
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    
    return result;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<ApiResponse<Patient>> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async deletePatient(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    const response = await fetch(`${API_BASE_URL}/patients/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Photo operations
  async uploadPhotos(patientId: string, files: File[], treatments: string, type: 'before' | 'after'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('treatments', treatments);
    formData.append('type', type);
    
    files.forEach(file => {
      formData.append('photos', file);
    });

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/photos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getPatientPhotos(patientId: string): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/photos/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Photo URL helper
export const getPhotoUrl = (photoId: string): string => {
  return `${API_BASE_URL}/photos/${photoId}`;
};

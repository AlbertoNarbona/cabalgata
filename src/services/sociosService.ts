import { toast } from "react-toastify";

// Interfaces
export interface Socio {
  id: number;
  nombre: string;
  direccion: string;
  codigo_postal: string;
  poblacion: string;
  provincia: string;
  email: string;
  telefono: string;
  zona: string;
  fecha_alta: string;
}

export interface Pariente {
  id: number;
  socio_id: number;
  nombre: string;
  tipo_relacion?: string | null;
}

// URL base del servidor
const API_BASE_URL = import.meta.env.VITE_URL_SERVER;

// Servicio para socios
export const sociosService = {
  // Obtener todos los socios
  async getSocios(): Promise<Socio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios`);
      if (!response.ok) {
        throw new Error('Error al obtener socios');
      }

      return await response.json();
    } catch (error) {
      toast.error('Error al obtener los socios');
      console.error('Error en getSocios:', error);
      throw error;
    }
  },

  // Crear nuevo socio
  async createSocio(socio: Omit<Socio, 'id'>): Promise<{ success: boolean, message: string, record: Socio }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socio),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear socio');
      }
      
      toast.success('Socio creado correctamente');
      return await response.json();
    } catch (error) {
      toast.error('Error al crear el socio');
      console.error('Error en createSocio:', error);
      throw error;
    }
  },

  // Actualizar socio
  async updateSocio(socio: Socio): Promise<Socio> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socio),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar socio');
      }
      
      toast.success('Socio actualizado correctamente');
      return await response.json();
    } catch (error) {
      toast.error('Error al actualizar el socio');
      console.error('Error en updateSocio:', error);
      throw error;
    }
  },

  // Eliminar socio
  async deleteSocio(id: number): Promise<{ success: boolean, message: string, record: Socio, parientes: Pariente[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar socio');
      }
      
      toast.success('Socio eliminado correctamente');
      return await response.json();
    } catch (error) {
      toast.error('Error al eliminar el socio');
      console.error('Error en deleteSocio:', error);
      throw error;
    }
  },
};

// Servicio para parientes
export const parientesService = {
  // Obtener todos los parientes
  async getParientes(): Promise<Pariente[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Parientes`);
      if (!response.ok) {
        throw new Error('Error al obtener parientes');
      }
      return await response.json();
    } catch (error) {
      toast.error('Error al obtener los parientes');
      console.error('Error en getParientes:', error);
      throw error;
    }
  },

  // Crear nuevo pariente
  async createPariente(pariente: Omit<Pariente, 'id'>): Promise<{ success: boolean, message: string, record: Pariente }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Parientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pariente),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear pariente');
      }
      toast.success('Pariente creado correctamente');
      return await response.json();
    } catch (error) {
      toast.error('Error al crear el pariente');
      console.error('Error en createPariente:', error);
      throw error;
    }
  },

  // Eliminar pariente
  async deletePariente(id: number): Promise<{ parientes: Pariente[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Parientes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar pariente');
      }
      toast.success('Pariente eliminado correctamente');

      return await response.json();
    } catch (error) {
      toast.error('Error al eliminar el pariente');
      console.error('Error en deletePariente:', error);
      throw error;
    }
  },
};
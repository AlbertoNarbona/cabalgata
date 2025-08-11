// Interfaces
import { Socio } from './sociosService';

export interface Recibo {
  id: number;
  socio_id: number;
  importe: number;
  fecha_creacion: string;
  concepto: string;
}

export interface ReciboConSocio extends Recibo {
  socio?: {
    id: number;
    nombre: string;
    direccion: string;
    zona: string;
  };
}

// URL base del servidor
const API_BASE_URL = import.meta.env.VITE_URL_SERVER;

// Servicio para recibos
export const recibosService = {
  // Obtener todos los recibos
  async getRecibos(): Promise<Recibo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Recibos`);
      if (!response.ok) {
        throw new Error('Error al obtener recibos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getRecibos:', error);
      throw error;
    }
  },

  // Crear nuevo recibo
  async createRecibo(recibo: { socio_id: number; importe: number; concepto?: string }): Promise<{success: boolean, message: string, record: Recibo}> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Recibos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recibo),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear recibo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createRecibo:', error);
      throw error;
    }
  },

  // Actualizar recibo
  async updateRecibo(recibo: Recibo): Promise<{success: boolean, message: string, record: Recibo}> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Recibos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recibo),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar recibo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updateRecibo:', error);
      throw error;
    }
  },

  // Eliminar recibo
  async deleteRecibo(id: number): Promise<{ recibos: Recibo[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Recibos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar recibo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en deleteRecibo:', error);
      throw error;
    }
  },

  // Obtener recibos con información del socio
  async getRecibosConSocios(): Promise<ReciboConSocio[]> {
    try {
      const [recibos, socios] = await Promise.all([
        this.getRecibos(),
        fetch(`${API_BASE_URL}/table/Socios`).then(res => res.json())
      ]);

      return recibos.map(recibo => {
        const socio = socios.find((s: Socio) => s.id === recibo.socio_id);
        return {
          ...recibo,
          socio: socio ? {
            id: socio.id,
            nombre: socio.nombre,
            direccion: socio.direccion,
            zona: socio.zona
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error en getRecibosConSocios:', error);
      throw error;
    }
  }
}; 
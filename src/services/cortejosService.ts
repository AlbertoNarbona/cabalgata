// Interfaces para cortejos
export interface Cortejo {
  id: number;
  nombre: string;
  ano: number;
}

export interface Carroza {
  id: number;
  cortejo_id: number;
  nombre: string;
  max_personas_carroza: number;
  max_beduinos: number;
}

export interface SocioCarroza {
  id: number;
  socio_id: number;
  carroza_id: number;
  tipo_usuario: 'carroza' | 'beduino';
  sitio: string;
  es_pariente?: boolean;
  pariente_id?: number;
}

// URL base del servidor
const API_BASE_URL = import.meta.env.VITE_URL_SERVER;

// Servicio para cortejos
export const cortejosService = {
  // Obtener todos los cortejos
  async getCortejos(): Promise<Cortejo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Cortejos`);
      if (!response.ok) {
        throw new Error('Error al obtener cortejos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getCortejos:', error);
      throw error;
    }
  },

  // Crear nuevo cortejo
  async createCortejo(cortejo: Omit<Cortejo, 'id'>): Promise<{success: boolean, message: string, record: Cortejo}> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Cortejos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cortejo),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear cortejo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createCortejo:', error);
      throw error;
    }
  },

  // Actualizar cortejo
  async updateCortejo(cortejo: Cortejo): Promise<Cortejo> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Cortejos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cortejo),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar cortejo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updateCortejo:', error);
      throw error;
    }
  },

  // Eliminar cortejo
  async deleteCortejo(id: number): Promise<{ cortejos: Cortejo[]; carrozas: Carroza[]; asignaciones: SocioCarroza[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Cortejos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar cortejo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en deleteCortejo:', error);
      throw error;
    }
  },
};

// Servicio para carrozas
export const carrozasService = {
  // Obtener carrozas por cortejo
  async getCarrozasByCortejo(cortejoId: number): Promise<Carroza[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tableSecondary/Carrozas/${cortejoId}`);
      if (!response.ok) {
        throw new Error('Error al obtener carrozas');
      }
      const result = await response.json();
      console.log('Carrozas cargadas:', result);
      return result;
    } catch (error) {
      console.error('Error en getCarrozasByCortejo:', error);
      throw error;
    }
  },

  // Crear nueva carroza
  async createCarroza(carroza: Omit<Carroza, 'id'>): Promise<Carroza> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Carrozas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carroza),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear carroza');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createCarroza:', error);
      throw error;
    }
  },

  // Actualizar carroza
  async updateCarroza(carroza: Carroza): Promise<Carroza> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Carrozas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carroza),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar carroza');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updateCarroza:', error);
      throw error;
    }
  },

  // Eliminar carroza
  async deleteCarroza(id: number): Promise<{ carrozas: Carroza[]; asignaciones: SocioCarroza[]; asignacionesEliminadas: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Carrozas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar carroza');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en deleteCarroza:', error);
      throw error;
    }
  },
};

// Servicio para asignaciones de socios a carrozas
export const sociosCarrozasService = {
  // Obtener asignaciones por carroza
  async getSociosByCarroza(carrozaId: number): Promise<SocioCarroza[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tableSecondary/Socios_Carrozas/${carrozaId}`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getSociosByCarroza:', error);
      throw error;
    }
  },

  // Crear nueva asignación
  async createSocioCarroza(asignacion: Omit<SocioCarroza, 'id'>): Promise<SocioCarroza> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios_Carrozas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignacion),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear asignación');
      }
      
      
      const result = await response.json();
      
      console.log('result', result);
      return result.asignacion;
    } catch (error) {
      console.error('Error en createSocioCarroza:', error);
      throw error;
    }
  },

  // Actualizar asignación
  async updateSocioCarroza(asignacion: SocioCarroza): Promise<SocioCarroza> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios_Carrozas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asignacion),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar asignación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updateSocioCarroza:', error);
      throw error;
    }
  },

  // Eliminar asignación
  async deleteSocioCarroza(id: number): Promise<{ asignaciones: SocioCarroza[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Socios_Carrozas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar asignación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en deleteSocioCarroza:', error);
      throw error;
    }
  },

  // Verificar si un sitio está disponible
  async isSitioDisponible(carrozaId: number, sitio: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/socios-carrozas/verificar-sitio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carroza_id: carrozaId, sitio }),
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar sitio');
      }
      
      const result = await response.json();
      return result.disponible;
    } catch (error) {
      console.error('Error en isSitioDisponible:', error);
      throw error;
    }
  },
}; 
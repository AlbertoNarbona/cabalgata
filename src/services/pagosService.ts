// Interfaces
export interface Pago {
  id: number;
  recibo_id: number;
  socio_id: number;
  fecha_pago: string;
  cantidad: number;
}

export interface PagoConDetalles extends Pago {
  recibo?: {
    id: number;
    concepto: string;
    importe: number;
  };
  socio?: {
    id: number;
    nombre: string;
  };
}

// URL base del servidor
const API_BASE_URL = import.meta.env.VITE_URL_SERVER;

// Servicio para pagos
export const pagosService = {
  // Obtener todos los pagos
  async getPagos(): Promise<Pago[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Pagos`);
      if (!response.ok) {
        throw new Error('Error al obtener pagos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getPagos:', error);
      throw error;
    }
  },

  // Obtener pagos por recibo ID
  async getPagosByRecibo(reciboId: number): Promise<Pago[]> {
    try {
      const pagos = await this.getPagos();
      return pagos.filter(pago => pago.recibo_id === reciboId);
    } catch (error) {
      console.error('Error en getPagosByRecibo:', error);
      throw error;
    }
  },

  // Crear nuevo pago
  async createPago(pago: { 
    recibo_id: number; 
    socio_id: number; 
    fecha_pago: string; 
    cantidad: number 
  }): Promise<{success: boolean, message: string, record: Pago}> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Pagos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pago),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear pago');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createPago:', error);
      throw error;
    }
  },

  // Actualizar pago
  async updatePago(pago: Pago): Promise<{success: boolean, message: string, record: Pago}> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Pagos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pago),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar pago');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updatePago:', error);
      throw error;
    }
  },

  // Eliminar pago
  async deletePago(id: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/table/Pagos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar pago');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en deletePago:', error);
      throw error;
    }
  },

  // Calcular total pagado por recibo
  async getTotalPagadoPorRecibo(reciboId: number): Promise<number> {
    try {
      const pagos = await this.getPagosByRecibo(reciboId);
      return pagos.reduce((total, pago) => total + pago.cantidad, 0);
    } catch (error) {
      console.error('Error en getTotalPagadoPorRecibo:', error);
      throw error;
    }
  },

  // Verificar si un recibo está completamente pagado
  async isReciboPagado(reciboId: number, importeRecibo: number): Promise<boolean> {
    try {
      const totalPagado = await this.getTotalPagadoPorRecibo(reciboId);
      return totalPagado >= importeRecibo;
    } catch (error) {
      console.error('Error en isReciboPagado:', error);
      throw error;
    }
  }
};

import { SocioCarroza } from "./cortejosService";

// Interfaces para papeletas
export interface Papeleta {
  id: number;
  tipo: 'carroza' | 'beduino';
  carroza: string;
  cortejo: string;
  sitio: string;
  socio: {
    id: number;
    nombre: string;
    poblacion: string;
    provincia: string;
  };
  parientes: {
    id: number;
    nombre: string;
    tipo_relacion: string | null;
    socio_nombre: string;
  }[];
}

// Interfaces para personas asignadas
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

interface Carroza {
  id: number;
  nombre: string;
  max_personas_carroza?: number;
  max_beduinos?: number;
}

// URL base del servidor
const API_BASE_URL = import.meta.env.VITE_URL_SERVER;

// Servicio para papeletas
export const papeletasService = {
  // Obtener solo socios y parientes que tienen asignaciones
  async getAsignados(): Promise<{ socios: Socio[], parientes: Pariente[] }> {
    try {
      // Obtener todas las asignaciones
      const response = await fetch(`${API_BASE_URL}/table/Socios_Carrozas`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones');
      }
      const asignaciones: SocioCarroza[] = await response.json();

      // Obtener todos los socios
      const responseSocios = await fetch(`${API_BASE_URL}/table/Socios`);
      if (!responseSocios.ok) {
        throw new Error('Error al obtener socios');
      }
      const todosSocios: Socio[] = await responseSocios.json();

      // Obtener todos los parientes
      const responseParientes = await fetch(`${API_BASE_URL}/table/Parientes`);
      if (!responseParientes.ok) {
        throw new Error('Error al obtener parientes');
      }
      const todosParientes: Pariente[] = await responseParientes.json();

      // Filtrar socios que tienen asignaciones (sitios que NO contienen '_p')
      const sociosAsignados = todosSocios.filter(socio => 
        asignaciones.some(asignacion => 
          asignacion.socio_id === socio.id && !asignacion.sitio.includes('_p')
        )
      );

      // Filtrar parientes que tienen asignaciones específicas (sitios que contienen '_p' con su ID)
      const parientesAsignados = todosParientes.filter(pariente => 
        asignaciones.some(asignacion => 
          asignacion.socio_id === pariente.socio_id && 
          asignacion.sitio.includes('_p') &&
          asignacion.sitio.includes(`p${pariente.id}`)
        )
      );

      return {
        socios: sociosAsignados,
        parientes: parientesAsignados
      };
    } catch (error) {
      console.error('Error en getAsignados:', error);
      throw error;
    }
  },

  // Obtener papeletas reales para generar
  async getPapeletasReales(): Promise<Papeleta[]> {
    try {
      // Obtener todas las asignaciones
      const response = await fetch(`${API_BASE_URL}/table/Socios_Carrozas`);
      if (!response.ok) {
        throw new Error('Error al obtener asignaciones');
      }
      const asignaciones: SocioCarroza[] = await response.json();

      // Obtener todos los socios
      const responseSocios = await fetch(`${API_BASE_URL}/table/Socios`);
      if (!responseSocios.ok) {
        throw new Error('Error al obtener socios');
      }
      const todosSocios: Socio[] = await responseSocios.json();

      // Obtener todos los parientes
      const responseParientes = await fetch(`${API_BASE_URL}/table/Parientes`);
      if (!responseParientes.ok) {
        throw new Error('Error al obtener parientes');
      }
      const todosParientes: Pariente[] = await responseParientes.json();

      // Obtener carrozas para el nombre
      const responseCarrozas = await fetch(`${API_BASE_URL}/table/Carrozas`);
      if (!responseCarrozas.ok) {
        throw new Error('Error al obtener carrozas');
      }
      const carrozas: Carroza[] = await responseCarrozas.json();

      // Generar papeletas reales
      const papeletas: Papeleta[] = [];

      asignaciones.forEach(asignacion => {
        const socio = todosSocios.find(s => s.id === asignacion.socio_id);
        if (!socio) return;

        const carroza = carrozas.find((c: Carroza) => c.id === asignacion.carroza_id);
        const carrozaNombre = carroza ? carroza.nombre : `Carroza ${asignacion.carroza_id}`;

        // Verificar si es asignación de pariente
        if (asignacion.sitio.includes('_p')) {
          // Es un pariente, extraer el ID del pariente del sitio
          const sitioParts = asignacion.sitio.split('_');
          const parienteId = parseInt(sitioParts[1].substring(1));
          const pariente = todosParientes.find(p => p.id === parienteId);
          
          if (pariente) {
            papeletas.push({
              id: asignacion.id,
              tipo: asignacion.tipo_usuario,
              carroza: carrozaNombre,
              cortejo: 'Cortejo Principal', // Por defecto
              sitio: asignacion.sitio,
              socio: {
                id: socio.id,
                nombre: socio.nombre,
                poblacion: socio.poblacion,
                provincia: socio.provincia
              },
              parientes: [{
                id: pariente.id,
                nombre: pariente.nombre,
                tipo_relacion: pariente.tipo_relacion || null,
                socio_nombre: socio.nombre
              }]
            });
          }
        } else {
          // Es el socio principal
          // Solo incluir parientes que también estén asignados a carrozas
          const parientesAsignados = todosParientes.filter(pariente => {
            // Verificar si este pariente tiene alguna asignación
            return asignaciones.some(asig => 
              asig.socio_id === socio.id && 
              asig.sitio.includes('_p') && 
              asig.sitio.includes(`p${pariente.id}`)
            );
          });
          
          papeletas.push({
            id: asignacion.id,
            tipo: asignacion.tipo_usuario,
            carroza: carrozaNombre,
            cortejo: 'Cortejo Principal', // Por defecto
            sitio: asignacion.sitio,
            socio: {
              id: socio.id,
              nombre: socio.nombre,
              poblacion: socio.poblacion,
              provincia: socio.provincia
            },
            parientes: parientesAsignados.map(p => ({
              id: p.id,
              nombre: p.nombre,
              tipo_relacion: p.tipo_relacion || null,
              socio_nombre: socio.nombre
            }))
          });
        }
      });

      return papeletas;
    } catch (error) {
      console.error('Error en getPapeletasReales:', error);
      throw error;
    }
  }
}; 
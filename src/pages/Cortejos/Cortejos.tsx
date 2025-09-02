import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import { Modal } from '../../components/ui/modal';
import { useModal } from '../../hooks/useModal';
import {
  cortejosService,
  carrozasService,
  sociosCarrozasService,
  Cortejo,
  Carroza,
  SocioCarroza,
} from '../../services/cortejosService';
import { sociosService, Socio } from '../../services/sociosService';
import { TrashBinIcon } from '../../icons';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { toast } from 'react-toastify';

type ElementoAEliminar = {
  tipo: 'cortejo' | 'carroza' | 'asignacion';
  elemento: Cortejo | Carroza | SocioCarroza;
};

interface Pariente {
  id: number;
  socio_id: number;
  nombre: string;
  tipo_relacion: string;
}

export default function Cortejos() {
  const [cortejosIniciales, setCortejosIniciales] = useState<Cortejo[]>([]);
  const [carrozasIniciales, setCarrozasIniciales] = useState<Carroza[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [asignacionesIniciales, setAsignacionesIniciales] = useState<SocioCarroza[]>([]);

  // Hooks de tiempo real
  const { data: cortejos } = useRealTimeData<Cortejo>({
    initialData: cortejosIniciales,
    eventPrefix: 'Cortejos',
    onCreated: (cortejo) => console.log('Nuevo cortejo:', cortejo.nombre),
    onUpdated: (cortejo) => console.log('Cortejo actualizado:', cortejo.nombre),
    onDeleted: (id) => console.log('Cortejo eliminado:', id)
  });

  const { data: carrozas } = useRealTimeData<Carroza>({
    initialData: carrozasIniciales,
    eventPrefix: 'Carrozas',
    onCreated: (carroza) => console.log('Nueva carroza:', carroza.nombre),
    onUpdated: (carroza) => console.log('Carroza actualizada:', carroza.nombre),
    onDeleted: (id) => console.log('Carroza eliminada:', id)
  });

  const { data: asignaciones } = useRealTimeData<SocioCarroza>({
    initialData: asignacionesIniciales,
    eventPrefix: 'Socios_Carrozas',
    onCreated: (asignacion) => console.log('Nueva asignación:', asignacion.id),
    onUpdated: (asignacion) => console.log('Asignación actualizada:', asignacion.id),
    onDeleted: (id) => console.log('Asignación eliminada:', id)
  });
  const [cortejoSeleccionado, setCortejoSeleccionado] =
    useState<Cortejo | null>(null);
  const [carrozaSeleccionada, setCarrozaSeleccionada] =
    useState<Carroza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const modalCortejo = useModal();
  const modalCarroza = useModal();
  const modalAsignacion = useModal();
  const modalConfirmarEliminacion = useModal();

  // Estados para formularios
  const [nuevoCortejo, setNuevoCortejo] = useState<Partial<Cortejo>>({
    nombre: '',
    ano: new Date().getFullYear(),
  });

  const [nuevaCarroza, setNuevaCarroza] = useState<Partial<Carroza>>({
    nombre: '',
    max_personas_carroza: undefined,
    max_beduinos: undefined,
  });

  const [nuevaAsignacion, setNuevaAsignacion] = useState<
    Partial<SocioCarroza> & { es_pariente?: boolean; pariente_id?: number }
  >({
    socio_id: undefined,
    tipo_usuario: 'carroza',
    sitio: '',
    es_pariente: false,
    pariente_id: undefined,
  });

  // Estado para elementos a eliminar
  const [elementoAEliminar, setElementoAEliminar] =
    useState<ElementoAEliminar | null>(null);

  // Cálculo de estadísticas por carroza
  const estadisticasPorCarroza = (() => {
    const stats: Record<
      number,
      {
        carroza: { ocupados: number; maximo: number };
        beduinos: { ocupados: number; maximo: number };
      }
    > = {};

    carrozas.forEach((carroza) => {
      const sociosCarroza = asignaciones.filter(
        (a) => a.carroza_id === carroza.id && a.tipo_usuario === 'carroza'
      ).length;
      const sociosBeduinos = asignaciones.filter(
        (a) => a.carroza_id === carroza.id && a.tipo_usuario === 'beduino'
      ).length;

      stats[carroza.id] = {
        carroza: {
          ocupados: sociosCarroza,
          maximo: carroza.max_personas_carroza,
        },
        beduinos: {
          ocupados: sociosBeduinos,
          maximo: carroza.max_beduinos,
        },
      };
    });

    return stats;
  })();

  const sitiosDisponiblesPorCarroza = (() => {
    const sitios: Record<number, Record<string, string[]>> = {};

    carrozas.forEach((carroza) => {
      sitios[carroza.id] = {
        carroza: [],
        beduino: [],
      };

      // Separar asignaciones por tipo de usuario
      const asignacionesCarroza = asignaciones.filter(
        (a) => a.carroza_id === carroza.id && a.tipo_usuario === 'carroza'
      );
      const asignacionesBeduino = asignaciones.filter(
        (a) => a.carroza_id === carroza.id && a.tipo_usuario === 'beduino'
      );

      // Obtener sitios ocupados por carroza
      const sitiosOcupadosCarroza = asignacionesCarroza.map((a) => {
        const sitioParts = a.sitio.split('_');
        return sitioParts[0];
      });

      // Obtener sitios ocupados por beduino
      const sitiosOcupadosBeduino = asignacionesBeduino.map((a) => {
        const sitioParts = a.sitio.split('_');
        return sitioParts[0];
      });

      // Sitios disponibles de carroza
      for (let i = 1; i <= carroza.max_personas_carroza; i++) {
        const sitio = i.toString();
        if (!sitiosOcupadosCarroza.includes(sitio)) {
          sitios[carroza.id].carroza.push(sitio);
        }
      }

      // Sitios disponibles de beduino
      for (let i = 1; i <= carroza.max_beduinos; i++) {
        const sitio = i.toString();
        if (!sitiosOcupadosBeduino.includes(sitio)) {
          sitios[carroza.id].beduino.push(sitio);
        }
      }
    });

    return sitios;
  })();

  // Funciones para cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cortejosData, sociosData, parientesData] = await Promise.all([
        cortejosService.getCortejos(),
        sociosService.getSocios(),
        fetch(`${import.meta.env.VITE_URL_SERVER}/table/Parientes`).then((res) =>
          res.json()
        ),
      ]);
      setCortejosIniciales(cortejosData);
      setSocios(sociosData);
      setParientes(parientesData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCarrozas = async (cortejoId: number) => {
    try {
      const carrozasData = await carrozasService.getCarrozasByCortejo(
        cortejoId
      );
      console.log('Carrozas cargadas:', carrozasData);
      setCarrozasIniciales(carrozasData);
    } catch (err) {
      setError('Error al cargar carrozas');
      console.error('Error cargando carrozas:', err);
    }
  };

  const cargarAsignaciones = async (carrozaId: number) => {
    try {
      const asignacionesData = await sociosCarrozasService.getSociosByCarroza(
        carrozaId
      );
      setAsignacionesIniciales(asignacionesData);
    } catch (err) {
      setError('Error al cargar asignaciones');
      console.error('Error cargando asignaciones:', err);
    }
  };

  const cargarTodasLasAsignaciones = useCallback(async () => {
    if (!cortejoSeleccionado || carrozas.length === 0) return;

    try {
      const todasLasAsignaciones = await Promise.all(
        carrozas.map((carroza) =>
          sociosCarrozasService.getSociosByCarroza(carroza.id)
        )
      );
      const asignacionesCompletas = todasLasAsignaciones.flat();
      setAsignacionesIniciales(asignacionesCompletas);
    } catch (err) {
      setError('Error al cargar todas las asignaciones');
      console.error('Error cargando todas las asignaciones:', err);
    }
  }, [cortejoSeleccionado, carrozas]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Combinar efectos de carga de carrozas y asignaciones
  useEffect(() => {
    if (cortejoSeleccionado) {
      cargarCarrozas(cortejoSeleccionado.id);
      setAsignacionesIniciales([]); // Limpiar asignaciones al cambiar cortejo
    } else {
      setCarrozasIniciales([]);
      setAsignacionesIniciales([]);
    }
  }, [cortejoSeleccionado]);

  // Cargar asignaciones cuando cambie la carroza seleccionada
  useEffect(() => {
    if (carrozaSeleccionada) {
      cargarAsignaciones(carrozaSeleccionada.id);
    }
  }, [carrozaSeleccionada]);

  // Cargar todas las asignaciones cuando se carguen las carrozas (solo si no hay carroza seleccionada)
  useEffect(() => {
    if (cortejoSeleccionado && carrozas.length > 0 && !carrozaSeleccionada) {
      cargarTodasLasAsignaciones();
    }
  }, [cortejoSeleccionado, carrozas, carrozaSeleccionada, cargarTodasLasAsignaciones]);

  // Limpiar sitio seleccionado cuando cambie el tipo de usuario
  useEffect(() => {
    setNuevaAsignacion((prev) => ({ ...prev, sitio: '' }));
  }, [nuevaAsignacion.tipo_usuario]);

  // Funciones para cortejos
  const crearCortejo = async () => {
    if (nuevoCortejo.nombre && nuevoCortejo.ano) {
      try {
        const result = await cortejosService.createCortejo({
          nombre: nuevoCortejo.nombre,
          ano: nuevoCortejo.ano,
        });
        setCortejosIniciales([...cortejosIniciales, result.record]);
        setNuevoCortejo({ nombre: '', ano: new Date().getFullYear() });
        modalCortejo.closeModal();
      } catch (err) {
        setError('Error al crear el cortejo');
        console.error('Error creando cortejo:', err);
      }
    }
  };

  const eliminarCortejo = async (id: number) => {
    try {
      const result = await cortejosService.deleteCortejo(id);
      console.log('Resultado de eliminar cortejo:', result);
      
      // Los cortejos se actualizarán automáticamente por WebSocket
      // Mostrar información sobre la eliminación en cascada
      const { cascadeDeleted } = result;
      let mensaje = 'Cortejo eliminado correctamente';
      
      if (cascadeDeleted?.carrozas || cascadeDeleted?.asignaciones) {
        const detalles = [];
        if (cascadeDeleted.carrozas) detalles.push(`${cascadeDeleted.carrozas} carrozas`);
        if (cascadeDeleted.asignaciones) detalles.push(`${cascadeDeleted.asignaciones} asignaciones`);
        mensaje += `. También se eliminaron: ${detalles.join(' y ')}`;
      }
      
      toast.success(mensaje);
      
      // Si se eliminó el cortejo seleccionado, limpiar la selección
      if (cortejoSeleccionado?.id === id) {
        setCortejoSeleccionado(null);
        setCarrozaSeleccionada(null);
        setCarrozasIniciales([]);
        setAsignacionesIniciales([]);
      }
      
      console.log('Eliminación en cascada completada:', cascadeDeleted);
    } catch (err) {
      setError('Error al eliminar el cortejo');
      console.error('Error eliminando cortejo:', err);
      // En caso de error, recargar los cortejos
      try {
        const cortejosActualizados = await cortejosService.getCortejos();
        setCortejosIniciales(cortejosActualizados);
      } catch (reloadErr) {
        console.error('Error al recargar cortejos:', reloadErr);
      }
    }
  };

  // Funciones para carrozas
  const crearCarroza = async (e?: React.FormEvent) => {
    // Prevenir el comportamiento por defecto del formulario
    if (e) {
      e.preventDefault();
    }
    if (
      nuevaCarroza.nombre &&
      nuevaCarroza.max_personas_carroza &&
      nuevaCarroza.max_beduinos &&
      cortejoSeleccionado
    ) {
      try {
        await carrozasService.createCarroza({
          cortejo_id: cortejoSeleccionado.id,
          nombre: nuevaCarroza.nombre,
          max_personas_carroza: nuevaCarroza.max_personas_carroza,
          max_beduinos: nuevaCarroza.max_beduinos,
        });
        
        // Recargar las carrozas desde el servidor para mantener sincronización
        const carrozasActualizadas = await carrozasService.getCarrozasByCortejo(cortejoSeleccionado.id);
        setCarrozasIniciales(carrozasActualizadas);
        
        setNuevaCarroza({
          nombre: '',
          max_personas_carroza: 8,
          max_beduinos: 4,
        });
        modalCarroza.closeModal();
        
        // Recargar todas las asignaciones del cortejo
        console.log('cortejoSeleccionado', cortejoSeleccionado);
        await cargarTodasLasAsignaciones();
        console.log('cortejoSeleccionado', cortejoSeleccionado);
      } catch (err) {
        setError('Error al crear la carroza');
        console.error('Error creando carroza:', err);
      }
    }
  };

  const eliminarCarroza = async (id: number) => {
    try {
      const result = await carrozasService.deleteCarroza(id);
      console.log('Resultado de eliminar carroza:', result);
      
      // Las carrozas se actualizarán automáticamente por WebSocket
      // Mostrar información sobre la eliminación en cascada
      const { cascadeDeleted } = result;
      let mensaje = 'Carroza eliminada correctamente';
      
      if (cascadeDeleted?.asignaciones) {
        mensaje += `. También se eliminaron ${cascadeDeleted.asignaciones} asignaciones`;
      }
      
      toast.success(mensaje);
      
      // Si se eliminó la carroza seleccionada, limpiar la selección
      if (carrozaSeleccionada?.id === id) {
        setCarrozaSeleccionada(null);
        setAsignacionesIniciales([]);
      } else {
        // Si no era la carroza seleccionada, actualizar las asignaciones
        if (cortejoSeleccionado) {
          await cargarTodasLasAsignaciones();
        }
      }
      
      console.log('Eliminación en cascada completada:', cascadeDeleted);
    } catch (err) {
      setError('Error al eliminar la carroza');
      console.error('Error eliminando carroza:', err);
      // En caso de error, recargar las carrozas
      try {
        if (cortejoSeleccionado) {
          const carrozasActualizadas = await carrozasService.getCarrozasByCortejo(cortejoSeleccionado.id);
          setCarrozasIniciales(carrozasActualizadas);
        }
      } catch (reloadErr) {
        console.error('Error al recargar carrozas:', reloadErr);
      }
    }
  };

  // Funciones para asignaciones
  const crearAsignacion = async () => {
    if (
      nuevaAsignacion.socio_id &&
      nuevaAsignacion.tipo_usuario &&
      nuevaAsignacion.sitio &&
      carrozaSeleccionada
    ) {
      try {
        // Si es un pariente, modificar el sitio para incluir información del pariente
        let sitioFinal = nuevaAsignacion.sitio;
        if (nuevaAsignacion.es_pariente && nuevaAsignacion.pariente_id) {
          sitioFinal = `${nuevaAsignacion.sitio}_p${nuevaAsignacion.pariente_id}`;
        }

        console.log('nuevaAsignacion', nuevaAsignacion);

        await sociosCarrozasService.createSocioCarroza({
          socio_id: nuevaAsignacion.socio_id,
          carroza_id: carrozaSeleccionada.id,
          tipo_usuario: nuevaAsignacion.tipo_usuario,
          sitio: sitioFinal,
        });
        
        // Limpiar el formulario
        setNuevaAsignacion({
          socio_id: undefined,
          tipo_usuario: 'carroza',
          sitio: '',
          es_pariente: false,
          pariente_id: undefined,
        });
        modalAsignacion.closeModal();
        
        // Actualizar solo las asignaciones de la carroza actual si está seleccionada
        if (carrozaSeleccionada) {
          const asignacionesActualizadas = await sociosCarrozasService.getSociosByCarroza(carrozaSeleccionada.id);
          setAsignacionesIniciales(asignacionesActualizadas);
        }
      } catch (err) {
        setError('Error al crear la asignación');
        console.error('Error creando asignación:', err);
      }
    }
  };

  // Obtener socio por ID
  const obtenerSocio = (socioId: number) => {
    return socios.find((s) => s.id === socioId);
  };

  // Obtener el número de sitio limpio (sin información adicional de pariente)
  const obtenerSitioLimpio = (sitio: string) => {
    const sitioParts = sitio.split('_');
    return sitioParts[0]; // Retorna solo el número del sitio
  };

  // Obtener información de la persona asignada (socio o pariente)
  const obtenerInfoPersona = (asignacion: SocioCarroza) => {
    const socio = obtenerSocio(asignacion.socio_id);
    if (!socio) return { nombre: 'No encontrado', relacion: 'Socio' };

    // Verificar si el sitio contiene información de pariente (formato: "1_p123")
    const sitioParts = asignacion.sitio.split('_');
    if (sitioParts.length > 1 && sitioParts[1].startsWith('p')) {
      // Es un pariente, extraer el ID del pariente
      const parienteId = parseInt(sitioParts[1].substring(1));
      const pariente = parientes.find((p) => p.id === parienteId);
      if (pariente) {
        return { nombre: pariente.nombre, relacion: pariente.tipo_relacion };
      }
    }

    // Si no es pariente o no se encuentra el pariente, es el socio principal
    return { nombre: socio.nombre, relacion: 'Socio' };
  };

  const eliminarAsignacion = async (id: number) => {
    try {
      await sociosCarrozasService.deleteSocioCarroza(id);
      
      // Actualizar solo las asignaciones de la carroza actual si está seleccionada
      if (carrozaSeleccionada) {
        const asignacionesActualizadas = await sociosCarrozasService.getSociosByCarroza(carrozaSeleccionada.id);
        setAsignacionesIniciales(asignacionesActualizadas);
      }
    } catch (err) {
      setError('Error al eliminar la asignación');
      console.error('Error eliminando asignación:', err);
    }
  };

  // Funciones para confirmación de eliminación
  const confirmarEliminacion = (
    tipo: 'cortejo' | 'carroza' | 'asignacion',
    elemento: Cortejo | Carroza | SocioCarroza
  ) => {
    setElementoAEliminar({ tipo, elemento });
    modalConfirmarEliminacion.openModal();
  };

  const ejecutarEliminacion = async () => {
    if (elementoAEliminar) {
      try {
        switch (elementoAEliminar.tipo) {
          case 'cortejo':
            await eliminarCortejo(elementoAEliminar.elemento.id);
            break;
          case 'carroza':
            await eliminarCarroza(elementoAEliminar.elemento.id);
            break;
          case 'asignacion':
            await eliminarAsignacion(elementoAEliminar.elemento.id);
            break;
        }
        modalConfirmarEliminacion.closeModal();
        setElementoAEliminar(null);
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
  };

  // Generar sitios disponibles según el tipo de usuario
  const generarSitiosDisponibles = (carroza: Carroza, tipoUsuario?: 'carroza' | 'beduino') => {
    const sitiosCarroza =
      sitiosDisponiblesPorCarroza[carroza.id]?.carroza || [];
    const sitiosBeduino =
      sitiosDisponiblesPorCarroza[carroza.id]?.beduino || [];

    if (tipoUsuario === 'carroza') {
      return sitiosCarroza;
    } else if (tipoUsuario === 'beduino') {
      return sitiosBeduino;
    } else {
      // Si no se especifica tipo, mostrar todos los sitios disponibles
      return [...sitiosCarroza, ...sitiosBeduino];
    }
  };

  // Verificar si una carroza está completa
  const carrozaCompleta = (carroza: Carroza) => {
    const stats = estadisticasPorCarroza[carroza.id];
    if (!stats) return false;

    return (
      stats.carroza.ocupados >= stats.carroza.maximo &&
      stats.beduinos.ocupados >= stats.beduinos.maximo
    );
  };

  // Verificar si los sitios de carroza están completos
  const carrozaLlena = (carroza: Carroza) => {
    const stats = estadisticasPorCarroza[carroza.id];
    if (!stats) return false;

    return stats.carroza.ocupados >= stats.carroza.maximo;
  };

  // Verificar si los sitios de beduinos están completos
  const beduinosLlenos = (carroza: Carroza) => {
    const stats = estadisticasPorCarroza[carroza.id];
    if (!stats) return false;

    return stats.beduinos.ocupados >= stats.beduinos.maximo;
  };

  // Mostrar loading mejorado
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50 text-center">
          <div className="animate-spin text-6xl mb-4">🎭</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Cargando Cortejos
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparando la gestión de cortejos...
          </p>
          <div className="flex justify-center mt-4">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header mejorado */}
        <div className="flex justify-between items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
          Gestión de Cortejos
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Organiza y gestiona los cortejos, carrozas y asignaciones
            </p>
          </div>
        {!cortejoSeleccionado && <Button
          onClick={modalCortejo.openModal}
            >
            <span className="mr-2">✨</span>
          Nuevo Cortejo
        </Button>}
      </div>

        {/* Breadcrumbs mejorados */}
      {(cortejoSeleccionado || carrozaSeleccionada) && (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/50">
            <nav className="flex items-center space-x-3 text-sm">
          <button
            onClick={() => {
              setCortejoSeleccionado(null);
              setCarrozaSeleccionada(null);
            }}
                className="flex items-center px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 font-medium transition-all duration-200 hover:scale-105">
                <span className="mr-2">🏠</span>
            Cortejos
          </button>
          {cortejoSeleccionado && (
            <>
                  <span className="text-gray-400">→</span>
              <button
                    onClick={() => setCarrozaSeleccionada(null)}
                    className="flex items-center px-3 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 font-medium transition-all duration-200 hover:scale-105">
                    <span className="mr-2">👑</span>
                {cortejoSeleccionado.nombre}
              </button>
            </>
          )}
              {carrozaSeleccionada && (
            <>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 text-orange-700 dark:text-orange-300 font-medium">
                    <span className="mr-2">🚗</span>
                {carrozaSeleccionada.nombre}
                  </div>
            </>
          )}
            </nav>
        </div>
      )}

      {/* Contenido principal */}
        <div className="space-y-8">
          {/* Panel de cortejos mejorado */}
        {!cortejoSeleccionado && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-200 border border-blue-300 rounded-xl mr-4">
                  <span className="text-2xl">👑</span>
                </div>
          <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Selecciona un Cortejo
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Elige el cortejo que deseas gestionar
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cortejos && cortejos.length > 0 ? cortejos.map((cortejo: Cortejo) => (
                  <div
                    key={cortejo.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-blue-100 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={() => {
                      setCortejoSeleccionado(cortejo);
                      setCarrozaSeleccionada(null);
                    }}>
                    
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-end mb-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarEliminacion('cortejo', cortejo);
                            }}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200">
                          <span className="text-red-500">
                            <TrashBinIcon />
                          </span>
                          </button>
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-2">
                        {cortejo.nombre}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          📅 {cortejo.ano}
                        </span>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-200">
                          <span className="text-sm font-medium mr-1">Ver</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No hay cortejos disponibles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Crea tu primer cortejo para comenzar
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

          {/* Panel de carrozas mejorado */}
        {cortejoSeleccionado && !carrozaSeleccionada && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="p-3 bg-purple-300 rounded-xl mr-4">
                      <span className="text-2xl">🚗</span>
                    </div>
          <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Carrozas de {cortejoSeleccionado.nombre}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Gestiona las carrozas y sus capacidades
                    </p>
                  </div>
                </div>
                <Button
                  onClick={modalCarroza.openModal}
                  type='button'
                  className="bg-purple-500 hover:bg-purple-700 text-purple-800 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nueva Carroza
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {carrozas && carrozas.length > 0 ? carrozas.map((carroza: Carroza) => {
                  const stats = estadisticasPorCarroza[carroza.id];
                  const carrozaProgress = stats ? (stats.carroza.ocupados / stats.carroza.maximo) * 100 : 0;
                  const beduinosProgress = stats ? (stats.beduinos.ocupados / stats.beduinos.maximo) * 100 : 0;
                  const isComplete = carrozaCompleta(carroza);
                  
                  return (
                    <div
                      key={carroza.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-purple-100 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-600"
                      onClick={() => {
                        setAsignacionesIniciales([]);
                        setCarrozaSeleccionada(carroza);
                      }}>
                      
                      {isComplete && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 z-20">
                          <span className="text-sm">✅</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-end mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarEliminacion('carroza', carroza);
                            }}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200">
                            <span className="text-red-500"><TrashBinIcon /></span>
                          </button>
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 line-clamp-1">
                          {carroza.nombre}
                        </h3>
                        
                        {/* Indicadores de progreso */}
                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-300">🚗 Carroza</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {stats?.carroza.ocupados || 0}/{stats?.carroza.maximo || 0}
                              </span>
                        </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  carrozaProgress >= 100 ? 'bg-red-500' : carrozaProgress >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(carrozaProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-300">🐪 Beduinos</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {stats?.beduinos.ocupados || 0}/{stats?.beduinos.maximo || 0}
                                  </span>
                                </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  beduinosProgress >= 100 ? 'bg-red-500' : beduinosProgress >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(beduinosProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                                <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isComplete 
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          }`}>
                            {isComplete ? '✅ Completa' : '⏳ Disponible'}
                                </div>
                          <div className="flex items-center text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform duration-200">
                            <span className="text-sm font-medium mr-1">Gestionar</span>
                            <span>→</span>
                              </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      No hay carrozas disponibles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Crea la primera carroza para este cortejo
                    </p>
                    </div>
                  )}
            </div>
          </div>
        )}

          {/* Panel de asignaciones mejorado */}
        {carrozaSeleccionada && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-200 border border-orange-300 rounded-xl mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
          <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Asignaciones de {carrozaSeleccionada.nombre}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Gestiona los participantes de la carroza
                    </p>
                  </div>
                </div>
                {!carrozaCompleta(carrozaSeleccionada) && (
                    <Button
                      onClick={modalAsignacion.openModal}
                      className="bg-orange-500 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <span className="mr-2">👤</span>
                    Asignar Persona
                    </Button>
                  )}
              </div>
              {carrozaSeleccionada ? (
                <div className="space-y-2">
                  {carrozaCompleta(carrozaSeleccionada) && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 dark:text-green-400">
                          ✅
                        </span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Carroza completa - Todos los sitios asignados
                        </span>
                      </div>
                    </div>
                  )}
                  {(() => {
                    const asignacionesCarroza = asignaciones
                      .filter((a) => a.tipo_usuario === 'carroza')
                      .sort((a, b) => parseInt(a.sitio) - parseInt(b.sitio));
                    const asignacionesBeduinos = asignaciones
                      .filter((a) => a.tipo_usuario === 'beduino')
                      .sort((a, b) => parseInt(a.sitio) - parseInt(b.sitio));

                    return (
                      <div className="space-y-4">
                        {/* Sección de Carrozas */}
                        {asignacionesCarroza.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                🚗 Carroza
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({asignacionesCarroza.length}/
                                {carrozaSeleccionada.max_personas_carroza})
                              </span>
                            </div>
                            <div
                              className="grid gap-3"
                              style={{
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(231px, 1fr))',
                              }}>
                              {asignacionesCarroza.map((asignacion) => {
                                const socio = obtenerSocio(asignacion.socio_id);
                                const infoPersona =
                                  obtenerInfoPersona(asignacion);
                                return (
                                  <div
                                    key={asignacion.id}
                                  className="group relative dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                  
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                          <span className="text-sm">🚗</span>
                                      </div>
                                        <div>
                                          <div className="font-semibold text-gray-800 dark:text-white text-sm">
                                            #{socio?.id} - {infoPersona.nombre}
                                          </div>
                                          <div className="text-xs text-blue-600 dark:text-blue-400">
                                            Sitio {obtenerSitioLimpio(asignacion.sitio)}
                                            {infoPersona.relacion !== 'Socio' && (
                                              <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs">
                                                {infoPersona.relacion}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                          onClick={() => console.log('Imprimir', asignacion)}
                                          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                          <span className="text-sm">🖨️</span>
                                        </button>
                                        <button
                                          onClick={() => confirmarEliminacion('asignacion', asignacion)}
                                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                          <span className="text-sm"><TrashBinIcon /></span>
                                        </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Sección de Beduinos */}
                        {asignacionesBeduinos.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                🐪 Beduinos
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({asignacionesBeduinos.length}/
                                {carrozaSeleccionada.max_beduinos})
                              </span>
                            </div>
                            <div
                              className="grid gap-3"
                              style={{
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(220px, 1fr))',
                              }}>
                              {asignacionesBeduinos.map((asignacion) => {
                                const socio = obtenerSocio(asignacion.socio_id);
                                const infoPersona =
                                  obtenerInfoPersona(asignacion);
                                return (
                                  <div
                                    key={asignacion.id}
                                  className="group relative dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                  
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                          <span className="text-sm">🐪</span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-800 dark:text-white text-sm">
                                            #{socio?.id} - {infoPersona.nombre}
                                          </div>
                                          <div className="text-xs text-purple-600 dark:text-purple-400">
                                            Sitio {obtenerSitioLimpio(asignacion.sitio)}
                                            {infoPersona.relacion !== 'Socio' && (
                                              <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded-full text-xs">
                                                {infoPersona.relacion}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                          onClick={() => console.log('Imprimir', asignacion)}
                                          className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                                          <span className="text-sm">🖨️</span>
                                        </button>
                                        <button
                                          onClick={() => confirmarEliminacion('asignacion', asignacion)}
                                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                          <span className="text-sm"><TrashBinIcon /></span>
                                        </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {asignaciones.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          Sin asignaciones
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Esta carroza aún no tiene personas asignadas
                      </p>
                      {!carrozaCompleta(carrozaSeleccionada) && (
                        <Button
                          onClick={modalAsignacion.openModal}
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                          <span className="mr-2">👤</span>
                          Asignar Primera Persona
                        </Button>
                      )}
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Selecciona una carroza
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Elige una carroza para ver y gestionar sus asignaciones
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Modal para crear cortejo */}
      <Modal isOpen={modalCortejo.isOpen} onClose={modalCortejo.closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Cortejo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Cortejo
              </label>
              <InputField
                value={nuevoCortejo.nombre || ''}
                onChange={(e) =>
                  setNuevoCortejo({ ...nuevoCortejo, nombre: e.target.value })
                }
                placeholder="Ej: Cortejo Real 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año
              </label>
              <InputField
                type="number"
                value={nuevoCortejo.ano || ''}
                onChange={(e) =>
                  setNuevoCortejo({
                    ...nuevoCortejo,
                    ano: parseInt(e.target.value),
                  })
                }
                placeholder="2024"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={modalCortejo.closeModal} variant="outline">
              Cancelar
            </Button>
            <Button onClick={crearCortejo} className="bg-primary text-white">
              Crear Cortejo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para crear carroza */}
      <Modal isOpen={modalCarroza.isOpen} onClose={modalCarroza.closeModal}>
        <form onSubmit={crearCarroza} className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nueva Carroza</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Carroza
              </label>
              <InputField
                value={nuevaCarroza.nombre || ''}
                required={true}
                onChange={(e) =>
                  setNuevaCarroza({ ...nuevaCarroza, nombre: e.target.value })
                }
                placeholder="Ej: Carroza Real"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máximo de Personas en Carroza
              </label>
              <InputField
                type="number"
                value={nuevaCarroza.max_personas_carroza || ''}
                onChange={(e) =>
                  setNuevaCarroza({
                    ...nuevaCarroza,
                    max_personas_carroza: parseInt(e.target.value),
                  })
                }
                placeholder="Ej: 50"
                required={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máximo de Beduinos
              </label>
              <InputField
                type="number"
                value={nuevaCarroza.max_beduinos || ''}
                required={true}
                onChange={(e) =>
                  setNuevaCarroza({
                    ...nuevaCarroza,
                    max_beduinos: parseInt(e.target.value),
                  })
                }
                placeholder="Ej: 50"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" onClick={modalCarroza.closeModal} variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-white">
              Crear Carroza
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para crear asignación */}
      <Modal
        isOpen={modalAsignacion.isOpen}
        onClose={modalAsignacion.closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Asignar Socio a Carroza
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Persona (Socio o Pariente)
              </label>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={
                  nuevaAsignacion.es_pariente
                    ? `pariente_${nuevaAsignacion.pariente_id}`
                    : nuevaAsignacion.socio_id
                    ? `socio_${nuevaAsignacion.socio_id}`
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('socio_')) {
                    const socioId = parseInt(value.replace('socio_', ''));
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      socio_id: socioId,
                      es_pariente: false,
                      pariente_id: undefined,
                    });
                  } else if (value.startsWith('pariente_')) {
                    const parienteId = parseInt(value.replace('pariente_', ''));
                    const pariente = parientes.find((p) => p.id === parienteId);
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      socio_id: pariente?.socio_id,
                      es_pariente: true,
                      pariente_id: parienteId,
                    });
                  } else {
                    setNuevaAsignacion({
                      ...nuevaAsignacion,
                      socio_id: undefined,
                      es_pariente: false,
                      pariente_id: undefined,
                    });
                  }
                }}>
                <option value="">Seleccionar persona</option>
                <optgroup label="Socios">
                  {socios.map((socio) => (
                    <option
                      key={`socio_${socio.id}`}
                      value={`socio_${socio.id}`}>
                      #{socio.id} - {socio.nombre} (Socio)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Parientes">
                  {parientes.map((pariente) => (
                    <option
                      key={`pariente_${pariente.id}`}
                      value={`pariente_${pariente.id}`}>
                      #{pariente.socio_id} - {pariente.nombre} (
                      {pariente.tipo_relacion})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Usuario
              </label>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={nuevaAsignacion.tipo_usuario || ''}
                onChange={(e) =>
                  setNuevaAsignacion({
                    ...nuevaAsignacion,
                    tipo_usuario: e.target.value as 'carroza' | 'beduino',
                  })
                }>
                <option value="carroza">Carroza</option>
                <option value="beduino">Beduino</option>
              </select>
              {carrozaSeleccionada && nuevaAsignacion.tipo_usuario && (
                <div className="mt-2">
                  {nuevaAsignacion.tipo_usuario === 'carroza' &&
                    carrozaLlena(carrozaSeleccionada) && (
                      <p className="text-xs text-red-500">
                        ⚠️ Los sitios de carroza están completos
                      </p>
                    )}
                  {nuevaAsignacion.tipo_usuario === 'beduino' &&
                    beduinosLlenos(carrozaSeleccionada) && (
                      <p className="text-xs text-red-500">
                        ⚠️ Los sitios de beduinos están completos
                      </p>
                    )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sitio
              </label>
              {carrozaSeleccionada && nuevaAsignacion.tipo_usuario && (
                <p className="text-xs text-gray-500 mb-2">
                  {nuevaAsignacion.tipo_usuario === 'carroza'
                    ? `Sitios disponibles: 1-${carrozaSeleccionada.max_personas_carroza} (Carroza)`
                    : `Sitios disponibles: 1-${carrozaSeleccionada.max_beduinos} (Beduinos)`}
                </p>
              )}
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={nuevaAsignacion.sitio || ''}
                onChange={(e) =>
                  setNuevaAsignacion({
                    ...nuevaAsignacion,
                    sitio: e.target.value,
                  })
                }>
                <option value="">Seleccionar sitio</option>
                {carrozaSeleccionada &&
                  nuevaAsignacion.tipo_usuario &&
                  generarSitiosDisponibles(
                    carrozaSeleccionada,
                    nuevaAsignacion.tipo_usuario
                  ).map((sitio) => (
                    <option key={sitio} value={sitio}>
                      Sitio {sitio}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={modalAsignacion.closeModal} variant="outline">
              Cancelar
            </Button>
            <Button onClick={crearAsignacion} className="bg-primary text-white">
              Asignar Socio
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={modalConfirmarEliminacion.isOpen}
        onClose={modalConfirmarEliminacion.closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ¿Estás seguro de que quieres eliminar este {elementoAEliminar?.tipo}
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={modalConfirmarEliminacion.closeModal}
              variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={ejecutarEliminacion}
              className="bg-red-500 text-white">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

        {/* Mostrar errores mejorado */}
      {error && (
          <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-2xl border border-red-400 backdrop-blur-lg max-w-md">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{error}</p>
              </div>
          <button
            onClick={() => setError(null)}
                className="flex-shrink-0 text-white hover:text-red-100 transition-colors p-1 rounded-lg hover:bg-red-400/20">
                <span className="text-lg">✕</span>
          </button>
            </div>
        </div>
      )}
      </div>
    </div>
  );
}

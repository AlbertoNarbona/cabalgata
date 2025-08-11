import { useState, useEffect } from 'react';
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
  const [cortejos, setCortejos] = useState<Cortejo[]>([]);
  const [carrozas, setCarrozas] = useState<Carroza[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [asignaciones, setAsignaciones] = useState<SocioCarroza[]>([]);
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
      setCortejos(cortejosData);
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
      setCarrozas(carrozasData);
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
      setAsignaciones(asignacionesData);
    } catch (err) {
      setError('Error al cargar asignaciones');
      console.error('Error cargando asignaciones:', err);
    }
  };

  const cargarTodasLasAsignaciones = async () => {
    if (!cortejoSeleccionado || carrozas.length === 0) return;

    try {
      const todasLasAsignaciones = await Promise.all(
        carrozas.map((carroza) =>
          sociosCarrozasService.getSociosByCarroza(carroza.id)
        )
      );
      const asignacionesCompletas = todasLasAsignaciones.flat();
      setAsignaciones(asignacionesCompletas);
    } catch (err) {
      setError('Error al cargar todas las asignaciones');
      console.error('Error cargando todas las asignaciones:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Combinar efectos de carga de carrozas y asignaciones
  useEffect(() => {
    if (cortejoSeleccionado) {
      cargarCarrozas(cortejoSeleccionado.id);
      setAsignaciones([]); // Limpiar asignaciones al cambiar cortejo
    } else {
      setCarrozas([]);
      setAsignaciones([]);
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
  }, [cortejoSeleccionado, carrozas, carrozaSeleccionada]);

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
        setCortejos([...cortejos, result.record]);
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
      
      // Verificar que result.cortejos existe y es un array
      if (result && result.cortejos && Array.isArray(result.cortejos)) {
        setCortejos(result.cortejos);
        console.log('Cortejos actualizados:', result.cortejos);
      } else {
        console.error('Respuesta inesperada del servidor:', result);
        // Recargar los cortejos desde el servidor como fallback
        const cortejosActualizados = await cortejosService.getCortejos();
        setCortejos(cortejosActualizados);
      }
      
      // Si se eliminó el cortejo seleccionado, limpiar la selección
      if (cortejoSeleccionado?.id === id) {
        setCortejoSeleccionado(null);
        setCarrozaSeleccionada(null);
        setCarrozas([]);
        setAsignaciones([]);
      }
      
      // Mostrar mensaje de éxito
      console.log(`Cortejo eliminado. Se eliminaron ${result.carrozas?.length || 0} carrozas y sus asignaciones.`);
    } catch (err) {
      setError('Error al eliminar el cortejo');
      console.error('Error eliminando cortejo:', err);
      // En caso de error, recargar los cortejos
      try {
        const cortejosActualizados = await cortejosService.getCortejos();
        setCortejos(cortejosActualizados);
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
        setCarrozas(carrozasActualizadas);
        
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
      
      // Verificar que result.carrozas existe y es un array
      if (result && result.carrozas && Array.isArray(result.carrozas)) {
        setCarrozas(result.carrozas);
        console.log('Carrozas actualizadas:', result.carrozas);
      } else {
        console.error('Respuesta inesperada del servidor:', result);
        // Recargar las carrozas desde el servidor como fallback
        if (cortejoSeleccionado) {
          const carrozasActualizadas = await carrozasService.getCarrozasByCortejo(cortejoSeleccionado.id);
          setCarrozas(carrozasActualizadas);
        }
      }
      
      // Si se eliminó la carroza seleccionada, limpiar la selección
      if (carrozaSeleccionada?.id === id) {
        setCarrozaSeleccionada(null);
        setAsignaciones([]);
      } else {
        // Si no era la carroza seleccionada, actualizar las asignaciones
        if (cortejoSeleccionado) {
          await cargarTodasLasAsignaciones();
        }
      }
      
      // Mostrar mensaje de éxito
      console.log(`Carroza eliminada. Se eliminaron ${result.asignacionesEliminadas} asignaciones.`);
    } catch (err) {
      setError('Error al eliminar la carroza');
      console.error('Error eliminando carroza:', err);
      // En caso de error, recargar las carrozas
      try {
        if (cortejoSeleccionado) {
          const carrozasActualizadas = await carrozasService.getCarrozasByCortejo(cortejoSeleccionado.id);
          setCarrozas(carrozasActualizadas);
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
          setAsignaciones(asignacionesActualizadas);
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
        setAsignaciones(asignacionesActualizadas);
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

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando cortejos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Gestión de Cortejos
        </h3>
        <Button
          onClick={modalCortejo.openModal}
          className="bg-primary text-white">
          Nuevo Cortejo
        </Button>
      </div>

      {/* Migas de pan */}
      {(cortejoSeleccionado || carrozaSeleccionada) && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => {
              setCortejoSeleccionado(null);
              setCarrozaSeleccionada(null);
            }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Cortejos
          </button>
          {cortejoSeleccionado && (
            <>
              <span>/</span>
              <button
                onClick={() => {
                  setCarrozaSeleccionada(null);
                }}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {cortejoSeleccionado.nombre}
              </button>
            </>
          )}
          {carrozaSeleccionada && cortejoSeleccionado && (
            <>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {carrozaSeleccionada.nombre}
              </span>
            </>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Panel de cortejos - Solo mostrar si no hay cortejo seleccionado */}
        {!cortejoSeleccionado && (
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h4 className="mb-4 text-md font-semibold text-gray-800 dark:text-white/90">
                Cortejos
              </h4>
              <div className="space-y-2">
                {cortejos && cortejos.length > 0 ? cortejos.map((cortejo: Cortejo) => (
                  <div
                    key={cortejo.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      cortejoSeleccionado?.id === cortejo.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg transform scale-105'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setCortejoSeleccionado(cortejo);
                      setCarrozaSeleccionada(null);
                    }}>
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">
                        {cortejo.nombre}
                      </div>
                      <div
                        className={`text-sm ${
                          cortejoSeleccionado?.id === cortejo.id
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        <div className="flex justify-between items-center w-full">
                          <span>Año {cortejo.ano}</span>

                          <span></span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarEliminacion('cortejo', cortejo);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              cortejoSeleccionado?.id === cortejo.id
                                ? 'text-white hover:bg-blue-400'
                                : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}>
                            <img
                              src="/images/icons/trash.svg"
                              alt="Eliminar"
                              className="w-4.5 h-4.5 brightness-0 saturate-100"
                              style={{
                                filter:
                                  'invert(23%) sepia(86%) saturate(6476%) hue-rotate(352deg) brightness(96%) contrast(101%)',
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No hay cortejos disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel de carrozas - Solo mostrar si hay cortejo seleccionado pero no carroza */}
        {cortejoSeleccionado && !carrozaSeleccionada && (
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">
                  Carrozas de {cortejoSeleccionado.nombre}
                </h4>
                <Button
                  onClick={modalCarroza.openModal}
                  className="bg-primary text-white"
                  size="sm">
                  +
                </Button>
              </div>
              <div className="space-y-2">
                {carrozas && carrozas.length > 0 ? carrozas.map((carroza: Carroza) => (
                    <div
                      key={carroza.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        carrozaSeleccionada?.id === carroza.id
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-lg transform scale-105'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
                      }`}
                      onClick={() => {
                        setAsignaciones([]);
                        setCarrozaSeleccionada(carroza);
                      }}>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">
                          {carroza.nombre}
                        </div>
                        <div
                          className={`text-sm mb-2 ${
                            carrozaSeleccionada?.id === carroza.id
                              ? 'text-purple-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}></div>

                        <div className="flex justify-between items-center gap-2">
                          {(() => {
                            const stats = estadisticasPorCarroza[carroza.id];
                            if (!stats) return null;
                            return (
                              <div
                                className={`text-xs space-y-1 ${
                                  carrozaSeleccionada?.id === carroza.id
                                    ? 'text-purple-100'
                                    : ''
                                }`}>
                                <div className="flex items-center justify-between">
                                  <span>Carroza:</span>
                                  <span
                                    className={`font-medium ${
                                      stats.carroza.ocupados >=
                                      stats.carroza.maximo
                                        ? 'text-red-300'
                                        : 'text-green-300'
                                    }`}>
                                    {stats.carroza.ocupados}/
                                    {stats.carroza.maximo}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Beduinos:</span>
                                  <span
                                    className={`font-medium ${
                                      stats.beduinos.ocupados >=
                                      stats.beduinos.maximo
                                        ? 'text-red-300'
                                        : 'text-green-300'
                                    }`}>
                                    {stats.beduinos.ocupados}/
                                    {stats.beduinos.maximo}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmarEliminacion('carroza', carroza);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              carrozaSeleccionada?.id === carroza.id
                                ? 'text-white hover:bg-purple-400'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}>
                            <img
                              src="/images/icons/trash.svg"
                              alt="Eliminar"
                              className="w-4.5 h-4.5 min-w-4.5 min-h-4.5 brightness-0 saturate-100"
                              style={{
                                filter:
                                  'invert(23%) sepia(86%) saturate(6476%) hue-rotate(352deg) brightness(96%) contrast(101%)',
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No hay carrozas disponibles
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Panel de asignaciones - Solo mostrar si hay carroza seleccionada */}
        {carrozaSeleccionada && (
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">
                  Asignaciones de {carrozaSeleccionada.nombre}
                </h4>
                {carrozaSeleccionada &&
                  !carrozaCompleta(carrozaSeleccionada) && (
                    <Button
                      onClick={modalAsignacion.openModal}
                      className="bg-primary text-white"
                      size="sm">
                      +
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
                                    className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
                                    <div className="flex flex-col">
                                      <div className="font-medium text-gray-800 dark:text-white text-sm truncate">
                                        #{socio?.id} - {infoPersona.nombre}
                                      </div>
                                      <div className="flex justify-between items-start text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Sitio{' '}
                                        {obtenerSitioLimpio(asignacion.sitio)} {infoPersona.relacion != 'Socio' && `(${infoPersona.relacion})`}
                                        <div>

                                        <button
                                          onClick={() =>
                                            confirmarEliminacion(
                                              'asignacion',
                                              asignacion
                                            )
                                          }
                                          className="p-1 text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0">
                                          <img src="/images/icons/printer.svg" alt="Imprimir" className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            confirmarEliminacion(
                                              'asignacion',
                                              asignacion
                                            )
                                          }
                                          className="p-1 text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0">
                                          <img
                                            src="/images/icons/trash.svg"
                                            alt="Eliminar"
                                            className="w-4.5 h-4.5 brightness-0 saturate-100"
                                            style={{
                                              filter:
                                                'invert(23%) sepia(86%) saturate(6476%) hue-rotate(352deg) brightness(96%) contrast(101%)',
                                            }}
                                          />
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
                                    className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
                                    <div className="flex flex-col">
                                      <div className="font-medium text-gray-800 dark:text-white text-sm truncate w-full">
                                        #{socio?.id} - {infoPersona.nombre} 
                                      </div>

                                      <div className="flex justify-between items-start text-xs text-purple-600 dark:text-purple-400 mt-1">
                                        Sitio{' '}
                                        {obtenerSitioLimpio(asignacion.sitio)} {infoPersona.relacion != 'Socio' && `(${infoPersona.relacion})`}
                                        
                                        <div>
                                        <button
                                          onClick={() =>
                                            confirmarEliminacion(
                                              'asignacion',
                                              asignacion
                                            )
                                          }
                                          className="p-1 text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0">
                                          <img src="/images/icons/printer.svg" alt="Imprimir" className="w-4.5 h-4.5" />
                                        </button>

                                        <button
                                          onClick={() =>
                                            confirmarEliminacion(
                                              'asignacion',
                                              asignacion
                                            )
                                          }
                                          className="p-1 text-purple-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0">
                                          <img
                                            src="/images/icons/trash.svg"
                                            alt="Eliminar"
                                            className="w-4.5 h-4.5 brightness-0 saturate-100"
                                            style={{
                                              filter:
                                                'invert(23%) sepia(86%) saturate(6476%) hue-rotate(352deg) brightness(96%) contrast(101%)',
                                            }}
                                          />
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
                  {asignaciones.length === 0 &&
                    !carrozaCompleta(carrozaSeleccionada) && (
                      <div className="p-4 text-center">
                        <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-gray-400">👥</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Sin asignaciones
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Selecciona una carroza para ver sus asignaciones
                </div>
              )}
            </div>
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

      {/* Mostrar errores */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:text-gray-200 p-1">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

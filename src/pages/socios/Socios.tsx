import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import InputField from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { sociosService, parientesService, Socio, Pariente } from "../../services/sociosService";
import SearchSocios from "../../components/socios/SearchSocios";
import SocioExpandedInfo from "../../components/socios/SocioExpandedInfo";
import { toast } from "react-toastify";
import { TrashBinIcon } from "../../icons";
import { useRealTimeData } from "../../hooks/useRealTimeData";



export default function Socios() {
  const [sociosIniciales, setSociosIniciales] = useState<Socio[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(null);
  const [parientesSocio, setParientesSocio] = useState<Pariente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sociosFiltrados, setSociosFiltrados] = useState<Socio[]>([]);
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [socioExpandido, setSocioExpandido] = useState<number | null>(null);

  // Hook de tiempo real para socios
  const { data: socios, isConnected } = useRealTimeData<Socio>({
    initialData: sociosIniciales,
    eventPrefix: 'Socios',
    onCreated: (socio) => {
      toast.success(`Nuevo socio creado: ${socio.nombre}`);
    },
    onUpdated: (socio) => {
      toast.info(`Socio actualizado: ${socio.nombre}`);
    },
    onDeleted: (id) => {
      toast.warn(`Socio eliminado (ID: ${id})`);
      setSocioExpandido(null);
      modalSocio.closeModal();
    }
  });
  
  // Modales
  const modalSocio = useModal();
  const modalParientes = useModal();
  const modalConfirmarEliminacion = useModal();
  
  // Estados para formularios
  const [nuevoSocio, setNuevoSocio] = useState<Partial<Socio>>({
    nombre: "",
    direccion: "",
    codigo_postal: "",
    poblacion: "",
    provincia: "",
    email: "",
    telefono: "",
    zona: "",
    fecha_alta: new Date().toISOString().split('T')[0]
  });
  
  const [nuevoPariente, setNuevoPariente] = useState<Partial<Pariente>>({
    nombre: "",
    tipo_relacion: ""
  });

  // Estado para el socio a eliminar
  const [socioAEliminar, setSocioAEliminar] = useState<Socio | null>(null);

  // Opciones para tipo de relación
  const opcionesTipoRelacion = [
    { value: "Hijo", label: "Hijo" },
    { value: "Mujer", label: "Mujer" },
    { value: "Marido", label: "Marido" }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [sociosData, parientesData] = await Promise.all([
          sociosService.getSocios(),
          parientesService.getParientes()
        ]);
        setSociosIniciales(sociosData);
        setParientes(parientesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para obtener parientes de un socio
  const obtenerParientes = (socioId: number) => {
    return parientes.filter(p => p.socio_id === socioId);
  };

  // Funciones para manejar la búsqueda
  const manejarResultadosBusqueda = (resultados: Socio[]) => {
    setSociosFiltrados(resultados);
    setMostrandoResultados(true);
  };

  const limpiarBusqueda = () => {
    setSociosFiltrados([]);
    setMostrandoResultados(false);
  };

  // Obtener socios a mostrar (filtrados o todos)
  const sociosAMostrar = mostrandoResultados ? sociosFiltrados : socios;

  // Función para manejar clic en fila de socio
  const toggleSocioExpandido = (socioId: number) => {
    setSocioExpandido(socioExpandido === socioId ? null : socioId);
  };

  // Función para abrir modal de parientes
  const abrirParientes = (socio: Socio) => {
    setSocioSeleccionado(socio);
    setParientesSocio(obtenerParientes(socio.id));
    modalParientes.openModal();
  };

  // Función para imprimir etiqueta
  const imprimirEtiqueta = (socio: Socio) => {
    // Aquí iría la lógica para imprimir la etiqueta
    console.log('Imprimiendo etiqueta para:', socio.nombre);
    // Por ahora solo muestra un alert
    alert(`Imprimiendo etiqueta para ${socio.nombre}`);
  };

  // Función para agregar nuevo socio
  const agregarSocio = async () => {
    if (nuevoSocio.nombre) {
      try {
        const response = await sociosService.createSocio({
          nombre: nuevoSocio.nombre,
          direccion: nuevoSocio.direccion || "",
          codigo_postal: nuevoSocio.codigo_postal || "",
          poblacion: nuevoSocio.poblacion || "",
          provincia: nuevoSocio.provincia || "",
          email: nuevoSocio.email || "",
          telefono: nuevoSocio.telefono || "",
          zona: nuevoSocio.zona || "",
          fecha_alta: nuevoSocio.fecha_alta || new Date().toISOString().split('T')[0]
        });

        if (!response?.success) {
          return toast.error(response?.message || 'Error al crear el socio');
        }
        
        // El nuevo socio se añadirá automáticamente por el WebSocket
        setNuevoSocio({
          nombre: "",
          direccion: "",
          codigo_postal: "",
          poblacion: "",
          provincia: "",
          email: "",
          telefono: "",
          zona: "",
          fecha_alta: new Date().toISOString().split('T')[0]
        });
        toast.success('Socio creado correctamente');
        modalSocio.closeModal();
      } catch (err) {
        toast.error('Error al crear el socio');
        setError('Error al crear el socio');
        console.error('Error creando socio:', err);
      }
    }
  };

  // Función para agregar nuevo pariente
  const agregarPariente = async () => {
    if (nuevoPariente.nombre && socioSeleccionado) {
      try {
        const pariente = await parientesService.createPariente({
          socio_id: socioSeleccionado.id,
          nombre: nuevoPariente.nombre,
          tipo_relacion: nuevoPariente.tipo_relacion || null
        });

        console.log(pariente);
        
        setParientes([...parientes, pariente.record]);
        setParientesSocio([...parientesSocio, pariente.record]);
        setNuevoPariente({ nombre: "", tipo_relacion: "" });
      } catch (err) {
        setError('Error al crear el pariente');
        console.error('Error creando pariente:', err);
      }
    }
  };

  // Función para eliminar socio
  const eliminarSocio = async (id: number) => {
    try {
      await sociosService.deleteSocio(id);
      
      // Después de eliminar, recargar parientes ya que no tienen tiempo real aún
      const parientesActualizados = await parientesService.getParientes();
      setParientes(parientesActualizados);
      
      // Los socios se actualizarán automáticamente por WebSocket
      
      // Limpiar búsqueda si estaba activa
      if (mostrandoResultados) {
        setSociosFiltrados([]);
        setMostrandoResultados(false);
      }
      
      // Cerrar cualquier socio expandido
      setSocioExpandido(null);
      
    } catch (err) {
      setError('Error al eliminar el socio');
      console.error('Error eliminando socio:', err);
    }
  };

  // Función para eliminar pariente
  const eliminarPariente = async (id: number) => {
    try {
      const result = await parientesService.deletePariente(id);
      setParientes(result.parientes);
      setParientesSocio(result.parientes.filter(p => p.socio_id === socioSeleccionado?.id));
    } catch (err) {
      setError('Error al eliminar el pariente');
      console.error('Error eliminando pariente:', err);
    }
  };

  // Función para actualizar socio
  const actualizarSocio = async (socioActualizado: Socio) => {
    try {
      await sociosService.updateSocio(socioActualizado);
      // Los cambios se reflejarán automáticamente por WebSocket
      
      // Si el socio actualizado está en los filtrados, actualizarlo también
      if (mostrandoResultados) {
        setSociosFiltrados(prevFiltrados => 
          prevFiltrados.map(s => s.id === socioActualizado.id ? socioActualizado : s)
        );
      }
    } catch (err) {
      setError('Error al actualizar el socio');
      console.error('Error actualizando socio:', err);
      throw err; // Re-lanzar el error para que el componente hijo lo maneje
    }
  };

  // Función para abrir modal de confirmación de eliminación
  const confirmarEliminacionSocio = (socio: Socio) => {
    setSocioAEliminar(socio);
    modalConfirmarEliminacion.openModal();
  };

  // Función para ejecutar la eliminación confirmada
  const ejecutarEliminacionSocio = async () => {
    if (socioAEliminar) {
      try {
        await eliminarSocio(socioAEliminar.id);
        modalConfirmarEliminacion.closeModal();
        setSocioAEliminar(null);
      } catch (err) {
        console.error('Error al eliminar socio:', err);
      }
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Cargando socios...</div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="text-red-800 dark:text-red-200">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-1">
            Gestión de Socios
          </h3>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Cargando...' : `${socios.length} socio${socios.length !== 1 ? 's' : ''} registrado${socios.length !== 1 ? 's' : ''}`}
              {mostrandoResultados && ` • ${sociosFiltrados.length} en resultados`}
            </p>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-400">
                {isConnected ? 'En tiempo real' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        <Button 
          onClick={modalSocio.openModal}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Socio
        </Button>
      </div>

      {/* Componente de búsqueda */}
      <SearchSocios
        socios={socios}
        onSearchResults={manejarResultadosBusqueda}
        onClearSearch={limpiarBusqueda}
      />

      {/* Tabla Principal de Socios */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 sm:p-6">
          {/* Indicador de resultados de búsqueda */}
          {mostrandoResultados && (
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {sociosFiltrados.length} socio{sociosFiltrados.length !== 1 ? 's' : ''} encontrado{sociosFiltrados.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarBusqueda}
                className="text-xs whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </Button>
            </div>
          )}
         
          {/* Estado vacío */}
          {sociosAMostrar?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {mostrandoResultados ? 'No se encontraron socios' : 'No hay socios registrados'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {mostrandoResultados 
                  ? 'Intenta ajustar los filtros de búsqueda o agregar un nuevo socio'
                  : 'Comienza agregando tu primer socio al sistema'
                }
              </p>
              {!mostrandoResultados && (
                <Button onClick={modalSocio.openModal} className="bg-blue-600 hover:bg-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Primer Socio
                </Button>
              )}
            </div>
          )}

          {/* Vista móvil - Cards */}
          {sociosAMostrar?.length > 0 && (
            <div className="block lg:hidden space-y-4">
              {sociosAMostrar?.map((socio) => (
              <div 
                key={socio.id}
                className="border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => toggleSocioExpandido(socio.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{socio.nombre}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">#{socio.id}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {obtenerParientes(socio.id).length} pariente{obtenerParientes(socio.id).length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {socio.direccion && <p>📍 {socio.direccion}</p>}
                  {socio.telefono && <p>📞 {socio.telefono}</p>}
                  {socio.email && <p>✉️ {socio.email}</p>}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); abrirParientes(socio); }}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    👥 Parientes
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); imprimirEtiqueta(socio); }}
                    className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                  >
                    🏷️ Etiqueta
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmarEliminacionSocio(socio); }}
                    className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
                
                {socioExpandido === socio.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <SocioExpandedInfo
                      socio={socio}
                      parientes={parientes}
                      onVerParientes={abrirParientes}
                      onImprimirEtiqueta={imprimirEtiqueta}
                      onEliminarSocio={() => confirmarEliminacionSocio(socio)}
                      onActualizarSocio={actualizarSocio}
                    />
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
          
          {/* Vista de escritorio - Tabla */}
          {sociosAMostrar?.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-50 dark:border-gray-800">
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Dirección</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Población</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Provincia</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Teléfono</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Zona</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha Alta</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Parientes</TableCell>
                  <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sociosAMostrar?.map((socio, index) => (
                  <React.Fragment key={socio.id}>
                    <TableRow 
                      className={`transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                      } ${socioExpandido === socio.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
                      onClick={() => toggleSocioExpandido(socio.id)}
                    >
                      <TableCell className="p-3 text-sm text-gray-900 dark:text-white">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400">#{socio.id}</span>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {socio.nombre}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {socio.direccion || <span className="text-gray-400 dark:text-gray-500 italic">Sin dirección</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {socio.poblacion || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {socio.provincia || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {socio.telefono || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {socio.email || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {socio.zona || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {socio.fecha_alta ? (
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                            {new Date(socio.fecha_alta).toLocaleDateString('es-ES')}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="p-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {obtenerParientes(socio.id).length} pariente{obtenerParientes(socio.id).length !== 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-1 scale-120">
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirParientes(socio); }}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100 hover:scale-105 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="Ver parientes"
                          >
                            👥
                          </button>
                          {/*<button
                            onClick={(e) => { e.stopPropagation(); imprimirEtiqueta(socio); }}
                            className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-100 hover:scale-105 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            title="Imprimir etiqueta"
                          >
                            🖨️
                          </button>*/}
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmarEliminacionSocio(socio); }}
                            className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-all hover:bg-red-100 hover:scale-105 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            title="Eliminar socio"
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Fila expandida con información detallada */}
                    {socioExpandido === socio.id && (
                      <tr className="bg-blue-50/50 dark:bg-blue-900/10">
                        <td colSpan={11} className="p-4">
                          <SocioExpandedInfo
                            socio={socio}
                            parientes={parientes}
                            onVerParientes={abrirParientes}
                            onImprimirEtiqueta={imprimirEtiqueta}
                            onEliminarSocio={() => confirmarEliminacionSocio(socio)}
                            onActualizarSocio={actualizarSocio}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar socio */}
      <Modal isOpen={modalSocio.isOpen} onClose={modalSocio.closeModal}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full max-h-[90vh] overflow-y-auto">
          {/* Header mejorado */}
          <div className="relative text-center mb-6 sm:mb-8">
            <button
              onClick={modalSocio.closeModal}
              className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 dark:from-blue-900/30 dark:to-blue-800/30">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nuevo Socio</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Completa los datos para registrar un nuevo socio</p>
          </div>
          
          {/* Formulario */}
          <form onSubmit={(e) => { e.preventDefault(); agregarSocio(); }} className="space-y-4 sm:space-y-6">
            {/* Información Personal */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-700/50">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-sm sm:text-base">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Información Personal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="Ej: Juan Pérez García"
                    value={nuevoSocio.nombre}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, nombre: e.target.value})}
                    required={true}
                    className={`${!nuevoSocio.nombre ? 'border-red-200 focus:border-red-400' : ''}`}
                  />
                  {!nuevoSocio.nombre && (
                    <p className="text-xs text-red-500 mt-1">Este campo es obligatorio</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de Alta <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    type="date"
                    value={nuevoSocio.fecha_alta}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, fecha_alta: e.target.value})}
                    required={true}
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 sm:p-5 border border-green-200/50 dark:border-green-700/30">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-sm sm:text-base">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Dirección
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección completa</label>
                  <InputField
                    placeholder="Ej: Calle Mayor, 123, 2ºB"
                    value={nuevoSocio.direccion}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, direccion: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código postal</label>
                    <InputField
                      placeholder="28001"
                      value={nuevoSocio.codigo_postal}
                      onChange={(e) => setNuevoSocio({...nuevoSocio, codigo_postal: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Población</label>
                    <InputField
                      placeholder="Madrid"
                      value={nuevoSocio.poblacion}
                      onChange={(e) => setNuevoSocio({...nuevoSocio, poblacion: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provincia</label>
                    <InputField
                      placeholder="Madrid"
                      value={nuevoSocio.provincia}
                      onChange={(e) => setNuevoSocio({...nuevoSocio, provincia: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zona</label>
                  <InputField
                    placeholder="Centro, Norte, Sur..."
                    value={nuevoSocio.zona}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, zona: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 sm:p-5 border border-purple-200/50 dark:border-purple-700/30">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-sm sm:text-base">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                Información de Contacto
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                  <InputField
                    type="tel"
                    placeholder="600 123 456"
                    value={nuevoSocio.telefono}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, telefono: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
                  <InputField
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={nuevoSocio.email}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            {/* Botones mejorados */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 order-2 sm:order-1 shadow-lg"
                disabled={!nuevoSocio.nombre}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Crear Socio
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={modalSocio.closeModal} 
                className="flex-1 order-1 sm:order-2 py-3 px-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para ver/agregar parientes */}
      <Modal isOpen={modalParientes.isOpen} onClose={modalParientes.closeModal}>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header mejorado */}
          <div className="relative mb-6">
            <button
              onClick={modalParientes.closeModal}
              className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center dark:from-blue-900/30 dark:to-blue-800/30">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Parientes de {socioSeleccionado?.nombre}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona los parientes asociados al socio</p>
              </div>
            </div>
          </div>
          
          {/* Información del socio mejorada */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-4 border border-blue-200/50 dark:border-blue-700/30">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información del Socio
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {socioSeleccionado?.direccion && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📍</span>
                  <span className="text-gray-700 dark:text-gray-300">{socioSeleccionado.direccion}</span>
                </div>
              )}
              {socioSeleccionado?.telefono && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📞</span>
                  <span className="text-gray-700 dark:text-gray-300">{socioSeleccionado.telefono}</span>
                </div>
              )}
              {socioSeleccionado?.email && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✉️</span>
                  <span className="text-gray-700 dark:text-gray-300">{socioSeleccionado.email}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabla de parientes */}
          <div className="mb-4">
            <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Parientes Registrados:</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-50 dark:border-gray-800">
                    <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</TableCell>
                    <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</TableCell>
                    <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Tipo de Relación</TableCell>
                    <TableCell isHeader className="p-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parientesSocio.map((pariente, index) => (
                    <TableRow 
                      key={pariente.id} 
                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }`}
                    >
                      <TableCell className="p-3 text-sm text-gray-900 dark:text-white">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{pariente.id}</span>
                      </TableCell>
                      <TableCell className="p-3 font-medium text-gray-900 dark:text-white">{pariente.nombre}</TableCell>
                      <TableCell className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {pariente.tipo_relacion || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-3">
                        <button
                          onClick={() => eliminarPariente(pariente.id)}
                          className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          Eliminar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Formulario para agregar pariente */}
          <div className="mb-4">
            <h4 className="mb-2 font-medium">Agregar Pariente:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <InputField
                placeholder="Nombre del pariente"
                value={nuevoPariente.nombre}
                onChange={(e) => setNuevoPariente({...nuevoPariente, nombre: e.target.value})}
              />
              <Select
                placeholder="Tipo de relación"
                defaultValue={nuevoPariente.tipo_relacion || ""}
                onChange={(value) => setNuevoPariente({...nuevoPariente, tipo_relacion: value})}
                options={opcionesTipoRelacion}
              />
            </div>
            <Button onClick={agregarPariente}>
              Agregar
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={modalParientes.closeModal}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal isOpen={modalConfirmarEliminacion.isOpen} onClose={modalConfirmarEliminacion.closeModal}>
        <div className="p-6 sm:p-8 max-w-lg mx-auto">
          {/* Header con icono mejorado */}
          <div className="relative text-center mb-6">
            <button
              onClick={modalConfirmarEliminacion.closeModal}
              className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 dark:from-red-900/30 dark:to-red-800/30 animate-pulse">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ⚠️ Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción es irreversible</p>
          </div>
          
          {/* Mensaje de confirmación mejorado */}
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 rounded-xl p-5 mb-6 border border-red-200/50 dark:border-red-700/30">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-800 dark:text-red-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Socio a eliminar:</span>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 rounded-lg p-3">
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {socioAEliminar?.nombre}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  ID: #{socioAEliminar?.id}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700/30">
                <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-sm">¡Atención!</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Se eliminarán también todos los parientes asociados a este socio. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>
          
          {/* Botones de acción mejorados */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={modalConfirmarEliminacion.closeModal}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 order-2 sm:order-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Button>
            <Button
              onClick={ejecutarEliminacionSocio}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 order-1 sm:order-2 shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

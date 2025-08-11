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



export default function Socios() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(null);
  const [parientesSocio, setParientesSocio] = useState<Pariente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sociosFiltrados, setSociosFiltrados] = useState<Socio[]>([]);
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [socioExpandido, setSocioExpandido] = useState<number | null>(null);
  
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
        setSocios(sociosData);
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
        
        setSocios([...socios, response.record]);
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
      
      // Después de eliminar y reorganizar IDs, recargar todos los datos
      const [sociosActualizados, parientesActualizados] = await Promise.all([
        sociosService.getSocios(),
        parientesService.getParientes()
      ]);
      
      setSocios(sociosActualizados);
      setParientes(parientesActualizados);
      
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
      const socio = await sociosService.updateSocio(socioActualizado);
      setSocios(prevSocios => 
        prevSocios.map(s => s.id === socio.id ? socio : s)
      );
      // Si el socio actualizado está en los filtrados, actualizarlo también
      if (mostrandoResultados) {
        setSociosFiltrados(prevFiltrados => 
          prevFiltrados.map(s => s.id === socio.id ? socio : s)
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
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Cargando socios...</div>
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
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Gestión de Socios
        </h3>
        <Button onClick={modalSocio.openModal}>
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
        <div className="p-6">
          {/* Indicador de resultados de búsqueda */}
          {mostrandoResultados && (
            <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Resultados de búsqueda: {sociosFiltrados.length} socio{sociosFiltrados.length !== 1 ? 's' : ''} encontrado{sociosFiltrados.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarBusqueda}
                className="text-xs"
              >
                Mostrar todos
              </Button>
            </div>
          )}
         
          
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-50 dark:border-gray-800">
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Dirección</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Población</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Provincia</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Teléfono</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Zona</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha Alta</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Parientes</TableCell>
                  <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sociosAMostrar?.map((socio, index) => (
                  <React.Fragment key={socio.id}>
                    <TableRow 
                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                      } ${socioExpandido === socio.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => toggleSocioExpandido(socio.id)}
                    >
                      <TableCell className="p-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{socio.id}</span>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {socio.nombre}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.direccion || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.poblacion || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.provincia || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.telefono || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.email || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.zona || <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                        {socio.fecha_alta ? new Date(socio.fecha_alta).toLocaleDateString('es-ES') : <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </TableCell>
                      <TableCell className="p-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-center">
                          {obtenerParientes(socio.id).length} pariente{obtenerParientes(socio.id).length !== 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirParientes(socio); }}
                            className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            Ver Parientes
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); imprimirEtiqueta(socio); }}
                            className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          >
                            Imprimir Etiqueta
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmarEliminacionSocio(socio); }}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            Eliminar
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
        </div>
      </div>

      {/* Modal para agregar socio */}
      <Modal isOpen={modalSocio.isOpen} onClose={modalSocio.closeModal}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 dark:bg-blue-900/30">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nuevo Socio</h3>
          </div>
          
          {/* Formulario */}
          <form onSubmit={(e) => { e.preventDefault(); agregarSocio(); }} className="space-y-4 sm:space-y-6">
            {/* Información Personal */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                  <InputField
                    placeholder="Nombre completo"
                    value={nuevoSocio.nombre}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, nombre: e.target.value})}
                    required={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Alta</label>
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
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dirección
              </h4>
              <div className="space-y-3 sm:space-y-4">
                <InputField
                  placeholder="Dirección completa"
                  value={nuevoSocio.direccion}
                  onChange={(e) => setNuevoSocio({...nuevoSocio, direccion: e.target.value})}
                  required={true}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <InputField
                    placeholder="Código postal"
                    value={nuevoSocio.codigo_postal}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, codigo_postal: e.target.value})}
                    required={true}
                  />
                  <InputField
                    placeholder="Población"
                    value={nuevoSocio.poblacion}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, poblacion: e.target.value})}
                    required={true}
                  />
                  <InputField
                    placeholder="Provincia"
                    value={nuevoSocio.provincia}
                    onChange={(e) => setNuevoSocio({...nuevoSocio, provincia: e.target.value})}
                    className="sm:col-span-2 lg:col-span-1"
                    required={true}
                  />
                </div>
                <InputField
                  placeholder="Zona"
                  value={nuevoSocio.zona}
                  onChange={(e) => setNuevoSocio({...nuevoSocio, zona: e.target.value})}
                  required={true}
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Información de Contacto
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <InputField
                  type="tel"
                  placeholder="Teléfono"
                  value={nuevoSocio.telefono}
                  onChange={(e) => setNuevoSocio({...nuevoSocio, telefono: e.target.value})}
                  required={true}
                />

                <InputField
                  type="email"
                  placeholder="Correo electrónico"
                  value={nuevoSocio.email}
                  onChange={(e) => setNuevoSocio({...nuevoSocio, email: e.target.value})}
                />
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 order-2 sm:order-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Crear Socio
              </Button>
              <Button type="button" variant="outline" onClick={modalSocio.closeModal} className="flex-1 order-1 sm:order-2">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para ver/agregar parientes */}
      <Modal isOpen={modalParientes.isOpen} onClose={modalParientes.closeModal}>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Parientes de {socioSeleccionado?.nombre}
      </h3>
          
          {/* Información del socio */}
          <div className="mb-4 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
            <h4 className="font-medium text-gray-800 dark:text-white">Información de Contacto:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {socioSeleccionado?.direccion && `Dirección: ${socioSeleccionado.direccion}`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {socioSeleccionado?.telefono && `Teléfono: ${socioSeleccionado.telefono}`}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {socioSeleccionado?.email && `Email: ${socioSeleccionado.email}`}
            </p>
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
        <div className="p-6 sm:p-8 max-w-md mx-auto">
          {/* Header con icono */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirmar Eliminación
            </h3>
          </div>
          
          {/* Mensaje de confirmación */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200 text-center">
              ¿Estás seguro de que quieres eliminar el socio
            </p>
            <p className="text-lg font-semibold text-red-900 dark:text-red-100 text-center mt-2">
              {socioAEliminar?.nombre}
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 text-center mt-2">
              Esta acción no se puede deshacer y eliminará también todos sus parientes asociados.
            </p>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={modalConfirmarEliminacion.closeModal}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                ejecutarEliminacionSocio();
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 order-1 sm:order-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar Socio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

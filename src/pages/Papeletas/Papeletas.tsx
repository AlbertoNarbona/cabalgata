import { useState, useEffect } from 'react';
import { PapeletaSitio } from '../../utils/papeletasSitio.tsx';
import { papeletasService, Papeleta as PapeletaReal, Socio, Pariente } from '../../services/papeletasService';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { SocioCarroza } from '../../services/cortejosService';

export default function Papeletas() {

  // Estados para manejar los datos
  const [sociosIniciales, setSociosIniciales] = useState<Socio[]>([]);
  const [parientesIniciales, setParientesIniciales] = useState<Pariente[]>([]);
  const [asignacionesIniciales, setAsignacionesIniciales] = useState<SocioCarroza[]>([]);
  const [papeletasReales, setPapeletasReales] = useState<PapeletaReal[]>([]);
  const [sociosSeleccionados, setSociosSeleccionados] = useState<string[]>([]);
  const [parientesSeleccionados, setParientesSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'socios' | 'parientes'>('socios');
  const [busqueda, setBusqueda] = useState('');

  // Hook de tiempo real para asignaciones (que afectan las papeletas)
  const { isConnected } = useRealTimeData<SocioCarroza>({
    initialData: asignacionesIniciales,
    eventPrefix: 'Socios_Carrozas',
    onCreated: () => {
      console.log('Nueva asignación - actualizando papeletas');
      recargarDatosDependientes();
    },
    onUpdated: () => {
      console.log('Asignación actualizada - actualizando papeletas');
      recargarDatosDependientes();
    },
    onDeleted: () => {
      console.log('Asignación eliminada - actualizando papeletas');
      recargarDatosDependientes();
    }
  });

  // Datos derivados de las asignaciones
  const [socios, setSocios] = useState<Socio[]>(sociosIniciales);
  const [parientes, setParientes] = useState<Pariente[]>(parientesIniciales);

  // Función para recargar datos que dependen de las asignaciones
  const recargarDatosDependientes = async () => {
    try {
      const [asignados, papeletas] = await Promise.all([
        papeletasService.getAsignados(),
        papeletasService.getPapeletasReales()
      ]);
      
      setSocios(asignados.socios);
      setParientes(asignados.parientes);
      setPapeletasReales(papeletas);
      
      console.log('Datos de papeletas actualizados en tiempo real');
    } catch (err) {
      console.error('Error recargando datos dependientes:', err);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar asignaciones para el tiempo real
        const responseAsignaciones = await fetch(`${import.meta.env.VITE_URL_SERVER}/table/Socios_Carrozas`);
        const asignacionesData = responseAsignaciones.ok ? await responseAsignaciones.json() : [];
        setAsignacionesIniciales(asignacionesData);
        
        const [asignados, papeletas] = await Promise.all([
          papeletasService.getAsignados(),
          papeletasService.getPapeletasReales()
        ]);
        
        setSociosIniciales(asignados.socios);
        setParientesIniciales(asignados.parientes);
        setSocios(asignados.socios);
        setParientes(asignados.parientes);
        setPapeletasReales(papeletas);
        
        console.log('Socios asignados:', asignados.socios);
        console.log('Parientes asignados:', asignados.parientes);
        console.log('Papeletas reales:', papeletas);
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

  // Función para manejar la selección de socios
  const handleSocioSelection = (socioId: string) => {
    setSociosSeleccionados(prev => {
      const isCurrentlySelected = prev.includes(socioId);
      
      if (isCurrentlySelected) {
        // Deseleccionar el socio y sus parientes
        const parientesDelSocio = parientes.filter(p => p.socio_id.toString() === socioId).map(p => p.id.toString());
        setParientesSeleccionados(prevParientes => 
          prevParientes.filter(id => !parientesDelSocio.includes(id))
        );
        return prev.filter(id => id !== socioId);
      } else {
        // Seleccionar el socio y sus parientes
        const parientesDelSocio = parientes.filter(p => p.socio_id.toString() === socioId).map(p => p.id.toString());
        setParientesSeleccionados(prevParientes => {
          const nuevosSeleccionados = [...new Set([...prevParientes, ...parientesDelSocio])];
          return nuevosSeleccionados;
        });
        return [...prev, socioId];
      }
    });
  };

  // Función para manejar la selección de parientes
  const handleParienteSelection = (parienteId: string) => {
    const pariente = parientes.find(p => p.id.toString() === parienteId);
    if (!pariente) return;

    setParientesSeleccionados(prev => {
      const isCurrentlySelected = prev.includes(parienteId);
      
      if (isCurrentlySelected) {
        // Deseleccionar el pariente
        // Si su socio está seleccionado, también hay que deseleccionarlo
        const socioId = pariente.socio_id.toString();
        if (sociosSeleccionados.includes(socioId)) {
          setSociosSeleccionados(prevSocios => 
            prevSocios.filter(id => id !== socioId)
          );
          
          // También deseleccionar otros parientes del mismo socio
          const otrosParientesDelSocio = parientes
            .filter(p => p.socio_id.toString() === socioId && p.id.toString() !== parienteId)
            .map(p => p.id.toString());
          
          return prev.filter(id => id !== parienteId && !otrosParientesDelSocio.includes(id));
        }
        
        return prev.filter(id => id !== parienteId);
      } else {
        // Seleccionar el pariente
        return [...prev, parienteId];
      }
    });
  };

  // Función para seleccionar/deseleccionar todos los socios
  const toggleAllSocios = () => {
    if (sociosSeleccionados.length === socios.length) {
      setSociosSeleccionados([]);
      // Al deseleccionar todos los socios, también deseleccionar sus parientes
      const parientesDeLosSocios = parientes.filter(p => 
        socios.some(s => s.id === p.socio_id)
      ).map(p => p.id.toString());
      setParientesSeleccionados(prev => 
        prev.filter(id => !parientesDeLosSocios.includes(id))
      );
    } else {
      setSociosSeleccionados(socios.map(s => s.id.toString()));
      // Al seleccionar todos los socios, también seleccionar automáticamente sus parientes
      const parientesDeLosSocios = parientes.filter(p => 
        socios.some(s => s.id === p.socio_id)
      ).map(p => p.id.toString());
      setParientesSeleccionados(prev => {
        const nuevosSeleccionados = [...new Set([...prev, ...parientesDeLosSocios])];
        return nuevosSeleccionados;
      });
    }
  };

  // Función para seleccionar/deseleccionar todos los parientes
  const toggleAllParientes = () => {
    if (parientesSeleccionados.length === parientes.length) {
      setParientesSeleccionados([]);
    } else {
      setParientesSeleccionados(parientes.map(p => p.id.toString()));
    }
  };

  // Generar papeletas solo para las personas seleccionadas
  const papeletasParaGenerar: PapeletaReal[] = (() => {
    const papeletasGeneradas: PapeletaReal[] = [];
    const papeletasYaGeneradas = new Set<string>(); // Para evitar duplicados
    
    // Si no hay selecciones, no generar ninguna papeleta
    if (sociosSeleccionados.length === 0 && parientesSeleccionados.length === 0) {
      return [];
    }
    
    // Generar papeletas para socios seleccionados
    sociosSeleccionados.forEach(socioId => {
      const parientesDelSocio = parientes.filter(p => p.socio_id.toString() === socioId);
      const parientesDelSocioSeleccionados = parientesDelSocio.filter(p => 
        parientesSeleccionados.includes(p.id.toString())
      );
      
      // Si el socio tiene parientes pero NO todos están seleccionados,
      // generar papeletas individuales solo para los parientes seleccionados
      if (parientesDelSocio.length > 0 && parientesDelSocioSeleccionados.length < parientesDelSocio.length) {
        // Generar papeleta del socio sin parientes
        const papeletasDelSocio = papeletasReales.filter((p: PapeletaReal) => p.socio.id.toString() === socioId);
        papeletasDelSocio.forEach(papeleta => {
          const key = `socio_solo_${papeleta.id}`;
          if (!papeletasYaGeneradas.has(key)) {
            papeletasGeneradas.push({
              ...papeleta,
              parientes: [] // Sin parientes, se generarán por separado
            });
            papeletasYaGeneradas.add(key);
          }
        });
        
        // Generar papeletas individuales para cada pariente seleccionado
        parientesDelSocioSeleccionados.forEach(pariente => {
          const papeletaDelSocio = papeletasReales.find((p: PapeletaReal) => p.socio.id.toString() === socioId);
          if (papeletaDelSocio) {
            const key = `pariente_${pariente.id}`;
            if (!papeletasYaGeneradas.has(key)) {
              papeletasGeneradas.push({
                ...papeletaDelSocio,
                id: papeletaDelSocio.id * 1000 + pariente.id,
                sitio: `${papeletaDelSocio.sitio}_p${pariente.id}`,
                parientes: [{
                  id: pariente.id,
                  nombre: pariente.nombre,
                  tipo_relacion: pariente.tipo_relacion || null,
                  socio_nombre: papeletaDelSocio.socio.nombre
                }]
              });
              papeletasYaGeneradas.add(key);
            }
          }
        });
      } else {
        // Generar papeleta completa del socio (incluye todos sus parientes)
        const papeletasDelSocio = papeletasReales.filter((p: PapeletaReal) => p.socio.id.toString() === socioId);
        papeletasDelSocio.forEach(papeleta => {
          const key = `socio_${papeleta.id}`;
          if (!papeletasYaGeneradas.has(key)) {
            papeletasGeneradas.push(papeleta);
            papeletasYaGeneradas.add(key);
          }
        });
      }
    });
    
    // Generar papeletas individuales para parientes seleccionados
    // Solo si su socio NO está seleccionado o si es una selección individual específica
    parientesSeleccionados.forEach(parienteId => {
      const parienteSeleccionado = parientes.find(p => p.id.toString() === parienteId);
      if (!parienteSeleccionado) return;

      const socioDelPariente = parienteSeleccionado.socio_id.toString();
      const socioEstaSeleccionado = sociosSeleccionados.includes(socioDelPariente);
      
      // Solo generar papeleta individual si el socio NO está seleccionado
      if (!socioEstaSeleccionado) {
        // Buscar la papeleta real específica de este pariente
        const papeletaPariente = papeletasReales.find((p: PapeletaReal) => 
          p.sitio.includes('_p') && p.sitio.includes(`p${parienteSeleccionado.id}`)
        );

        if (papeletaPariente) {
          const key = `pariente_solo_${parienteSeleccionado.id}`;
          if (!papeletasYaGeneradas.has(key)) {
            // Generar papeleta SOLO para el pariente, sin incluir al socio como participante
            papeletasGeneradas.push({
              ...papeletaPariente,
              id: papeletaPariente.id,
              sitio: papeletaPariente.sitio,
              parientes: [{
                id: parienteSeleccionado.id,
                nombre: parienteSeleccionado.nombre,
                tipo_relacion: parienteSeleccionado.tipo_relacion || null,
                socio_nombre: papeletaPariente.socio.nombre
              }]
            });
            papeletasYaGeneradas.add(key);
          }
        } else {
          // Fallback: Si no existe papeleta específica, crear una basada en el socio pero solo para el pariente
          const papeletaDelSocio = papeletasReales.find((p: PapeletaReal) => 
            p.socio.id === parienteSeleccionado.socio_id && !p.sitio.includes('_p')
          );

          if (papeletaDelSocio) {
            const key = `pariente_fallback_${parienteSeleccionado.id}`;
            if (!papeletasYaGeneradas.has(key)) {
              
              console.log(papeletaDelSocio)
              
              papeletasGeneradas.push({
                ...papeletaDelSocio,
                id: papeletaDelSocio.id * 1000 + parienteSeleccionado.id,
                sitio: `${papeletaDelSocio.sitio}_p${parienteSeleccionado.id}`,
                tipo: 'beduino', // Los parientes suelen ser beduinos
                parientes: [{
                  id: parienteSeleccionado.id,
                  nombre: parienteSeleccionado.nombre,
                  tipo_relacion: parienteSeleccionado.tipo_relacion || null,
                  socio_nombre: papeletaDelSocio.socio.nombre
                }]
              });
              papeletasYaGeneradas.add(key);
            }
          }
        }
      }
    });
    
    return papeletasGeneradas;
  })();

  // Obtener parientes de un socio específico
  const getParientesBySocio = (socioId: number) => {
    return parientes.filter(p => p.socio_id === socioId);
  };

  // Filtrar socios por búsqueda
  const sociosFiltrados = socios.filter(socio =>
    socio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    socio.poblacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    socio.provincia?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Filtrar parientes por búsqueda
  const parientesFiltrados = parientes.filter(pariente =>
    pariente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    pariente.tipo_relacion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Mostrar loading
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Papeletas
        </h3>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="text-lg">Cargando datos...</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Papeletas
        </h3>
        <div className="space-y-6">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="text-red-800 dark:text-red-200">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje cuando no hay personas asignadas
  if (!loading && socios.length === 0 && parientes.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-5 flex items-center justify-between lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Papeletas de Sitio
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'En tiempo real' : 'Desconectado'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">👥</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay personas asignadas
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay personas con sitios asignados en carrozas. Ve a la sección de Cortejos para asignar personas.
            </p>
            <button 
              onClick={() => window.location.href = '/cortejos'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a Cortejos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-5 flex items-center justify-between lg:mb-7">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Papeletas de Sitio
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'En tiempo real' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Selector de participantes */}
      <div className="mb-6">
        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, población, provincia o tipo de relación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {busqueda && (
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                Buscando: "{busqueda}" - {sociosFiltrados.length + parientesFiltrados.length} resultado{sociosFiltrados.length + parientesFiltrados.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setBusqueda('')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Tabs para Socios y Parientes */}
        <div className="mb-4">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('socios')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'socios'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Socios ({sociosFiltrados.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('parientes')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'parientes'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Parientes ({parientesFiltrados.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contenido de los tabs */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          {activeTab === 'socios' && (
            <div className="space-y-3">
              {/* Header con select all */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h5 className="font-medium text-gray-900 dark:text-white">Socios</h5>
                <button
                  onClick={toggleAllSocios}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {sociosSeleccionados.length === socios.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              
              {/* Lista de socios */}
              <div className="grid gap-3 max-h-50 overflow-y-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
                {sociosFiltrados.length > 0 ? (
                  sociosFiltrados.map((socio) => {
                    const parientesSocio = getParientesBySocio(socio.id);
                    const isSelected = sociosSeleccionados.includes(socio.id.toString());
                    
                    return (
                      <div
                        key={socio.id}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleSocioSelection(socio.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {socio.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {socio.poblacion && `${socio.poblacion}`}
                              {socio.poblacion && socio.provincia && ', '}
                              {socio.provincia}
                            </div>
                            {parientesSocio.length > 0 && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {parientesSocio.length} pariente{parientesSocio.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-4 text-center text-gray-500 dark:text-gray-400">
                    {busqueda ? 'No se encontraron socios con esa búsqueda' : 'No hay socios asignados'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'parientes' && (
            <div className="space-y-3">
              {/* Header con select all */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h5 className="font-medium text-gray-900 dark:text-white">Parientes</h5>
                <button
                  onClick={toggleAllParientes}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {parientesSeleccionados.length === parientes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              
              {/* Lista de parientes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {parientesFiltrados.length > 0 ? (
                  parientesFiltrados.map((pariente) => {
                    const socioPariente = socios.find(s => s.id === pariente.socio_id);
                    const isSelected = parientesSeleccionados.includes(pariente.id.toString());
                    
                    return (
                      <div
                        key={pariente.id}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleParienteSelection(pariente.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {pariente.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {pariente.tipo_relacion || 'Pariente'}
                            </div>
                            {socioPariente && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                de {socioPariente.nombre}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-4 text-center text-gray-500 dark:text-gray-400">
                    {busqueda ? 'No se encontraron parientes con esa búsqueda' : 'No hay parientes asignados'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Información de selección */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mostrando solo personas con sitios asignados ({socios.length + parientes.length} total)</span>
          </div>
          
          {sociosSeleccionados.length === 0 && parientesSeleccionados.length === 0 ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Selecciona participantes para generar sus papeletas</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Generando {papeletasParaGenerar.length} papeleta{papeletasParaGenerar.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

        <div className="flex w-full h-full" style={{height: '100vh'}}>
        <PapeletaSitio papeleta={papeletasParaGenerar.map((p: PapeletaReal) => {
          // Determinar si es una papeleta de pariente o socio
          const esPariente = p.sitio.includes('_p');
          
          if (esPariente) {
            // Es una papeleta de pariente
            const pariente = p.parientes[0]; // Ya filtramos para que solo tenga el pariente seleccionado
            if (!pariente) {
              // Si no hay pariente, es un error en los datos, usar datos del socio
              return {
                id: p.socio.id.toString(),
                nombre: p.socio.nombre,
                carroza: p.carroza,
                tipo: p.tipo,
                sitio: p.sitio.split('_')[0],
                pariente: p.socio.nombre,
              };
            }
            // Verificar si es una papeleta SOLO de pariente (socio no seleccionado)
            const socioEstaSeleccionado = sociosSeleccionados.includes(p.socio.id.toString());
            
            if (!socioEstaSeleccionado) {
              // Papeleta SOLO para el pariente - el pariente es el protagonista
              return {
                id: pariente.id.toString(), // ID del pariente
                nombre: pariente.nombre, // Nombre del pariente como protagonista
                carroza: p.carroza,
                tipo: p.tipo,
                sitio: p.sitio.split('_')[0], // Solo el número del sitio
                pariente: `Familiar de ${p.socio.nombre}`, // Indicar la relación
              };
            } else {
              // Papeleta donde tanto socio como pariente están seleccionados
              return {
                id: pariente.id.toString(), // ID del pariente
                nombre: p.socio.nombre, // Nombre del socio
                carroza: p.carroza,
                tipo: p.tipo,
                sitio: p.sitio.split('_')[0], // Solo el número del sitio
                pariente: pariente.nombre, // Nombre del pariente
              };
            }
          } else {
            // Es una papeleta de socio
            return {
              id: p.socio.id.toString(),
              nombre: p.socio.nombre,
              carroza: p.carroza,
              tipo: p.tipo,
              sitio: p.sitio,
              pariente: p.parientes.length > 0 ? p.parientes[0].nombre : p.socio.nombre,
            };
          }
        })} />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { RecibosCabalgatas } from '../../utils/recibosCabalgatas.tsx';
import { sociosService, Socio } from '../../services/sociosService';
import { recibosService, Recibo as ReciboDB } from '../../services/recibosService';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import { Modal } from '../../components/ui/modal';
import { useModal } from '../../hooks/useModal';
import { toast } from 'react-toastify';

interface Recibo {
  id: string;
  nombre: string;
  direccion: string;
  zona: string;
  importe: number | undefined;
  socioId?: string;
  concepto?: string;
}

export default function Recibos() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [recibosDB, setRecibosDB] = useState<ReciboDB[]>([]);
  const [recibosFiltrados, setRecibosFiltrados] = useState<ReciboDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [zonaFiltro, setZonaFiltro] = useState('');
  const [mostrandoRecibos, setMostrandoRecibos] = useState(false);
  
  // Modal para agregar recibos
  const modalAgregarRecibo = useModal();
  
  // Modal para editar recibos
  const modalEditarRecibo = useModal();
  
  // Estados para el formulario de recibo
  const [nuevoRecibo, setNuevoRecibo] = useState<Partial<Recibo>>({
    nombre: '',
    direccion: '',
    zona: '',
    importe: 0,
    socioId: undefined,
    concepto: undefined
  });

  // Estado para el recibo que se está editando
  const [reciboEditando, setReciboEditando] = useState<ReciboDB | null>(null);
  const [reciboEditandoForm, setReciboEditandoForm] = useState<{
    socio_id: number;
    importe: number;
    concepto: string;
  }>({
    socio_id: 0,
    importe: 0,
    concepto: ''
  });

  // Cargar socios y recibos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [sociosData, recibosData] = await Promise.all([
          sociosService.getSocios(),
          recibosService.getRecibos()
        ]);
        setSocios(sociosData);
        setRecibosDB(recibosData);
        setRecibosFiltrados(recibosData); // Inicializar con todos los recibos
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

  // Filtrar recibos por búsqueda y zona
  useEffect(() => {
    let filtrados = recibosDB;

    if (busqueda) {
      filtrados = filtrados.filter(recibo => {
        const socio = socios.find(s => s.id === recibo.socio_id);
        return socio && (
          socio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          socio.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
          recibo.concepto.toLowerCase().includes(busqueda.toLowerCase())
        );
      });
    }

    if (zonaFiltro) {
      filtrados = filtrados.filter(recibo => {
        const socio = socios.find(s => s.id === recibo.socio_id);
        return socio && socio.zona === zonaFiltro;
      });
    }

    setRecibosFiltrados(filtrados);
  }, [recibosDB, socios, busqueda, zonaFiltro]);

  // Obtener zonas únicas para el filtro
  const zonas = [...new Set(socios.map(socio => socio.zona).filter(zona => zona))];

  // Función para agregar recibo
  const agregarRecibo = async () => {
    if (nuevoRecibo.nombre && nuevoRecibo.importe && nuevoRecibo.socioId) {
      try {
        // Crear recibo en la base de datos
        const {record} = await recibosService.createRecibo({
          socio_id: parseInt(nuevoRecibo.socioId),
          importe: nuevoRecibo.importe,
          concepto: nuevoRecibo.concepto || undefined
        });

        // Agregar a la lista local
        const recibo: Recibo = {
          id: record.id.toString(),
          nombre: nuevoRecibo.nombre,
          direccion: nuevoRecibo.direccion || '',
          zona: nuevoRecibo.zona || '',
          importe: nuevoRecibo.importe,
          socioId: nuevoRecibo.socioId,
          concepto: nuevoRecibo.concepto || undefined
        };

        setRecibos([...recibos, recibo]);
        setRecibosDB([...recibosDB, record]);
        setRecibosFiltrados([...recibosFiltrados, record]);
        
        // Limpiar formulario
        setNuevoRecibo({
          nombre: '',
          direccion: '',
          zona: '',
          importe: 0,
          socioId: undefined,
          concepto: undefined
        });
        modalAgregarRecibo.closeModal();
      } catch (err) {
        setError('Error al crear el recibo en la base de datos');
        console.error('Error creando recibo:', err);
      }
    }
  };

  // Función para eliminar recibo
  const eliminarRecibo = async (id: string) => {
    try {
      await recibosService.deleteRecibo(parseInt(id));
      setRecibos(recibos.filter(recibo => recibo.id !== id));
      setRecibosDB(recibosDB.filter(recibo => recibo.id !== parseInt(id)));
      setRecibosFiltrados(recibosFiltrados.filter(recibo => recibo.id !== parseInt(id)));
    } catch (err) {
      setError('Error al eliminar el recibo');
      console.error('Error eliminando recibo:', err);
    }
  };

  // Función para actualizar recibo
  const actualizarRecibo = async (id: string, campo: keyof Recibo, valor: string | number) => {
    try {
      const reciboIndex = recibos.findIndex(r => r.id === id);
      if (reciboIndex === -1) return;

      const reciboActualizado = { ...recibos[reciboIndex], [campo]: valor };
      console.log('reciboActualizado', reciboActualizado);
      setRecibos(recibos.map(recibo =>
        recibo.id === id ? reciboActualizado : recibo
      ));

      // Si se actualiza el importe, actualizar también en la base de datos
      if (campo === 'importe' && reciboActualizado.socioId) {
        const reciboDB = recibosDB.find(r => r.id === parseInt(id));
        if (reciboDB) {
          const reciboActualizadoDB = await recibosService.updateRecibo({
            ...reciboDB,
            importe: valor as number
          });
          setRecibosDB(recibosDB.map(r => r.id === parseInt(id) ? reciboActualizadoDB : r));
        }
      }
    } catch (err) {
      setError('Error al actualizar el recibo');
      console.error('Error actualizando recibo:', err);
    }
  };

  // Función para limpiar recibos
  const limpiarRecibos = () => {
    setRecibos([]);
    setMostrandoRecibos(false);
  };

  // Función para abrir modal de edición
  const abrirEditarRecibo = (recibo: ReciboDB) => {
    setReciboEditando(recibo);
    setReciboEditandoForm({
      socio_id: recibo.socio_id,
      importe: recibo.importe,
      concepto: recibo.concepto
    });
    modalEditarRecibo.openModal();
  };

  // Función para guardar cambios del recibo editado
  const guardarReciboEditado = async () => {
    if (!reciboEditando) return;

    try {
      const {record} = await recibosService.updateRecibo({
        ...reciboEditando,
        ...reciboEditandoForm
      });

      console.log('reciboEditando', reciboEditando);
      console.log('reciboActualizado', record);

      // Actualizar en la lista local
      setRecibosDB(recibosDB.map(r => r.id === reciboEditando.id ? record : r));
      setRecibosFiltrados(recibosFiltrados.map(r => r.id === reciboEditando.id ? record : r));

      // Cerrar modal y limpiar estado
      modalEditarRecibo.closeModal();
      setReciboEditando(null);
      setReciboEditandoForm({
        socio_id: 0,
        importe: 0,
        concepto: ''
      });

      toast.success('Recibo actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el recibo');
      setError('Error al actualizar el recibo');
      console.error('Error actualizando recibo:', err);
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
          Generación de Recibos
        </h3>
        <div className="flex gap-2">
          <Button onClick={modalAgregarRecibo.openModal}>
            Agregar Recibo Manual
          </Button>
          {recibos.length > 0 && (
            <Button 
              onClick={() => setMostrandoRecibos(!mostrandoRecibos)}
              variant="outline"
            >
              {mostrandoRecibos ? 'Ocultar Recibos' : `Ver Recibos (${recibos.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar recibos
          </label>
          <InputField
            placeholder="Buscar por nombre de socio, dirección o concepto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrar por zona
          </label>
          <Select
            defaultValue={zonaFiltro}
            onChange={(value) => typeof value === 'string' ? setZonaFiltro(value) : setZonaFiltro('')}
            options={zonas.map(zona => ({ value: zona, label: zona }))}
            placeholder="Todas las zonas"
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={limpiarRecibos}
            variant="outline"
            className="w-full"
          >
            Limpiar Recibos
          </Button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(busqueda || zonaFiltro) && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Filtros activos: {recibosFiltrados.length} de {recibosDB.length} recibos
            </span>
            {busqueda && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Búsqueda: "{busqueda}"
              </span>
            )}
            {zonaFiltro && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Zona: {zonaFiltro}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusqueda('');
              setZonaFiltro('');
            }}
            className="text-xs"
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Tabla de Recibos Generados */}
      {recibos.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Recibos Generados ({recibos.length})
            </h4>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-50 dark:border-gray-800">
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Dirección</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Zona</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Importe (€)</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recibos.map((recibo, index) => (
                    <TableRow 
                      key={recibo.id}
                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }`}
                    >
                      <TableCell className="p-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{recibo.id}</span>
                      </TableCell>
                      <TableCell className="p-2">
                        <InputField
                          value={recibo.nombre}
                          onChange={(e) => actualizarRecibo(recibo.id, 'nombre', e.target.value)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <InputField
                          value={recibo.direccion}
                          onChange={(e) => actualizarRecibo(recibo.id, 'direccion', e.target.value)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <InputField
                          value={recibo.zona}
                          onChange={(e) => actualizarRecibo(recibo.id, 'zona', e.target.value)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <InputField
                          type="number"
                          value={recibo.importe}
                          onChange={(e) => actualizarRecibo(recibo.id, 'importe', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => eliminarRecibo(recibo.id)}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Recibos Guardados en Base de Datos */}
      {recibosFiltrados.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Recibos ({recibosFiltrados.length})
              {busqueda || zonaFiltro ? ` - Filtrados` : ''}
            </h4>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-50 dark:border-gray-800">
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Socio ID</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Importe (€)</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Concepto</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recibosFiltrados.map((recibo, index) => {
                    const socio = socios.find(s => s.id === recibo.socio_id);
                    return (
                      <TableRow 
                        key={recibo.id}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                        }`}
                      >
                       
                        <TableCell className="p-2">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {socio?.nombre || `Socio #${recibo.socio_id}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {recibo.socio_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2 text-sm font-medium text-gray-900 dark:text-white">
                          {recibo?.importe ? Number(recibo.importe).toFixed(2) : '0.00'} €
                        </TableCell>
                        <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                          {recibo.concepto}
                        </TableCell>
                        
                        <TableCell className="p-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => abrirEditarRecibo(recibo)}
                              className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarRecibo(recibo.id.toString())}
                              className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Recibos PDF */}
      {mostrandoRecibos && recibos.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Vista Previa de Recibos
          </h3>
          <RecibosCabalgatas papeleta={recibos.map(recibo => ({
            id: recibo.id,
            nombre: recibo.nombre,
            direccion: recibo.direccion,
            zona: recibo.zona,
            importe: recibo.importe || 0
          }))} />
        </div>
      )}

      {/* Modal para agregar recibo manual */}
      <Modal isOpen={modalAgregarRecibo.isOpen} onClose={modalAgregarRecibo.closeModal}>
        <div className="p-6 sm:p-8 max-w-md mx-auto">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Agregar Recibo Manual
          </h3>
          
          <form onSubmit={(e) => { e.preventDefault(); agregarRecibo(); }} className="space-y-4">
            {/* Select para elegir socio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seleccionar socio
              </label>
              <Select
                defaultValue={nuevoRecibo.socioId || ''}
                onChange={(value) => {
                  if (value) {
                    const socio = socios.find(s => String(s.id) === value);
                    if (socio) {
                      setNuevoRecibo({
                        ...nuevoRecibo,
                        socioId: String(socio.id),
                        nombre: socio.nombre,
                        direccion: socio.direccion,
                        zona: socio.zona
                      });
                    }
                  } else {
                    setNuevoRecibo({
                      ...nuevoRecibo,
                      socioId: undefined,
                      nombre: '',
                      direccion: '',
                      zona: ''
                    });
                  }
                }}
                options={socios.map(socio => ({ value: String(socio.id), label: socio.nombre }))}
                placeholder="Buscar socio..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <InputField
                placeholder="Nombre completo"
                value={nuevoRecibo.nombre}
                onChange={(e) => setNuevoRecibo({...nuevoRecibo, nombre: e.target.value})}
                required={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dirección
              </label>
              <InputField
                placeholder="Dirección completa"
                value={nuevoRecibo.direccion}
                onChange={(e) => setNuevoRecibo({...nuevoRecibo, direccion: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zona
              </label>
              <InputField
                placeholder="Zona"
                value={nuevoRecibo.zona}
                onChange={(e) => setNuevoRecibo({...nuevoRecibo, zona: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Importe (€) *
              </label>
              <InputField
                type="number"
                placeholder="0.00"
                value={nuevoRecibo.importe || ''}
                onChange={(e) => setNuevoRecibo({...nuevoRecibo, importe: parseFloat(e.target.value) || 0})}
                required={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Concepto (opcional)
              </label>
              <InputField
                placeholder="Concepto del recibo"
                value={nuevoRecibo.concepto}
                onChange={(e) => setNuevoRecibo({...nuevoRecibo, concepto: e.target.value || undefined})}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Agregar Recibo
              </Button>
              <Button type="button" variant="outline" onClick={modalAgregarRecibo.closeModal}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para editar recibo */}
      <Modal isOpen={modalEditarRecibo.isOpen} onClose={modalEditarRecibo.closeModal}>
        <div className="p-6 sm:p-8 max-w-md mx-auto">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Editar Recibo #{reciboEditando?.id}
          </h3>
          
          <form onSubmit={(e) => { e.preventDefault(); guardarReciboEditado(); }} className="space-y-4">
            {/* Select para elegir socio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Socio
              </label>
              <Select
                defaultValue={String(reciboEditandoForm.socio_id)}
                onChange={(value) => {
                  if (value) {
                    setReciboEditandoForm({
                      ...reciboEditandoForm,
                      socio_id: parseInt(value)
                    });
                  }
                }}
                options={socios.map(socio => ({ value: String(socio.id), label: socio.nombre }))}
                placeholder="Seleccionar socio..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Importe (€) *
              </label>
              <InputField
                type="number"
                placeholder="0.00"
                value={reciboEditandoForm.importe}
                onChange={(e) => setReciboEditandoForm({
                  ...reciboEditandoForm, 
                  importe: parseFloat(e.target.value) || 0
                })}
                required={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Concepto
              </label>
              <InputField
                placeholder="Concepto del recibo"
                value={reciboEditandoForm.concepto}
                onChange={(e) => setReciboEditandoForm({
                  ...reciboEditandoForm, 
                  concepto: e.target.value
                })}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Guardar Cambios
              </Button>
              <Button type="button" variant="outline" onClick={modalEditarRecibo.closeModal}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

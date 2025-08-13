import { useState, useEffect, useCallback } from 'react';
import { RecibosCabalgatas } from '../../utils/recibosCabalgatas.tsx';
import { sociosService, Socio } from '../../services/sociosService';
import { recibosService, Recibo as ReciboDB } from '../../services/recibosService';
import { pagosService, Pago } from '../../services/pagosService';
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
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [zonaFiltro, setZonaFiltro] = useState('');
  const [estadoPagoFiltro, setEstadoPagoFiltro] = useState(''); // '', 'pagado', 'pendiente'
  const [mostrandoRecibos, setMostrandoRecibos] = useState(false);
  
  // Modal para agregar recibos
  const modalAgregarRecibo = useModal();
  
  // Modal para editar recibos
  const modalEditarRecibo = useModal();
  
  // Modal para agregar pagos
  const modalAgregarPago = useModal();
  
  // Modal para ver pagos de un recibo
  const modalVerPagos = useModal();
  
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

  // Estado para pagos
  const [reciboSeleccionado, setReciboSeleccionado] = useState<ReciboDB | null>(null);
  const [nuevoPago, setNuevoPago] = useState<{
    cantidad: number;
    fecha_pago: string;
  }>({
    cantidad: 0,
    fecha_pago: new Date().toISOString().split('T')[0]
  });
  const [pagosRecibo, setPagosRecibo] = useState<Pago[]>([]);

  // Función para calcular total pagado de un recibo
  const getTotalPagado = useCallback((reciboId: number): number => {
    return pagos
      .filter(pago => pago.recibo_id === reciboId)
      .reduce((total, pago) => total + Number(pago.cantidad), 0);
  }, [pagos]);

  // Función para verificar si un recibo está pagado
  const isReciboPagado = useCallback((recibo: ReciboDB): boolean => {
    const totalPagado = getTotalPagado(recibo.id);
    return totalPagado >= recibo.importe;
  }, [getTotalPagado]);

  // Cargar socios y recibos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [sociosData, recibosData, pagosData] = await Promise.all([
          sociosService.getSocios(),
          recibosService.getRecibos(),
          pagosService.getPagos()
        ]);
        setSocios(sociosData);
        setRecibosDB(recibosData);
        setRecibosFiltrados(recibosData); // Inicializar con todos los recibos
        setPagos(pagosData);
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

  // Filtrar recibos por búsqueda, zona y estado de pago
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

    if (estadoPagoFiltro) {
      filtrados = filtrados.filter(recibo => {
        const estaPagado = isReciboPagado(recibo);
        return estadoPagoFiltro === 'pagado' ? estaPagado : !estaPagado;
      });
    }

    setRecibosFiltrados(filtrados);
  }, [recibosDB, socios, busqueda, zonaFiltro, estadoPagoFiltro, pagos, isReciboPagado]);

  // Obtener zonas únicas para el filtro
  const zonas = [...new Set(socios.map(socio => socio.zona).filter(zona => zona))];

  // Función para agregar recibo
  const agregarRecibo = async () => {
    if (nuevoRecibo.nombre && nuevoRecibo.importe && nuevoRecibo.socioId) {
      console.log('nuevoRecibo', nuevoRecibo);
      try {
        // Crear recibo en la base de datos
        const {record} = await recibosService.createRecibo({
          socio_id: parseInt(nuevoRecibo.socioId),
          importe: nuevoRecibo.importe,
          concepto: nuevoRecibo.concepto || undefined,
          zona: nuevoRecibo.zona || undefined,
          direccion: nuevoRecibo.direccion || undefined
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
          setRecibosDB(recibosDB.map(r => r.id === parseInt(id) ? reciboActualizadoDB.record : r));
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

  const agregarTodosLosRecibos = async () => {
    
    console.log('recibosDB', recibosDB);
    const recibosConvertidos = recibosDB?.map(r => {
      const socio = socios.find(s => s.id === r.socio_id);
      return {
        id: r?.id.toString(),
        nombre: socio?.nombre || '',
        direccion: socio?.direccion || '',
        zona: socio?.zona || '',
        importe: r?.importe,
        socioId: r.socio_id.toString(),
        concepto: r.concepto
      };
    }) || [];
    setRecibos(recibosConvertidos);
  };

  console.log('recibos', recibos);

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

  // Función para abrir modal de agregar pago
  const abrirAgregarPago = (recibo: ReciboDB) => {
    setReciboSeleccionado(recibo);
    setNuevoPago({
      cantidad: 0,
      fecha_pago: new Date().toISOString().split('T')[0]
    });
    modalAgregarPago.openModal();
  };

  // Función para agregar pago
  const agregarPago = async () => {
    if (!reciboSeleccionado || nuevoPago.cantidad <= 0) {
      toast.error('Por favor ingrese una cantidad válida');
      return;
    }

    try {
      const {record} = await pagosService.createPago({
        recibo_id: reciboSeleccionado?.id,
        socio_id: reciboSeleccionado?.socio_id,
        fecha_pago: nuevoPago.fecha_pago,
        cantidad: nuevoPago.cantidad
      });

      // Actualizar la lista de pagos
      setPagos([...pagos, record]);
      
      // Limpiar formulario y cerrar modal
      setNuevoPago({
        cantidad: 0,
        fecha_pago: new Date().toISOString().split('T')[0]
      });
      modalAgregarPago.closeModal();
      setReciboSeleccionado(null);
      
      toast.success('Pago agregado correctamente');
    } catch (err) {
      toast.error('Error al agregar el pago');
      console.error('Error agregando pago:', err);
    }
  };

  // Función para ver pagos de un recibo
  const verPagosRecibo = async (recibo: ReciboDB) => {
    try {
      const pagosDelRecibo = await pagosService.getPagosByRecibo(recibo.id);
      setPagosRecibo(pagosDelRecibo);
      setReciboSeleccionado(recibo);
      modalVerPagos.openModal();
    } catch (err) {
      toast.error('Error al cargar los pagos');
      console.error('Error cargando pagos:', err);
    }
  };

  // Función para eliminar pago
  const eliminarPago = async (pagoId: number) => {
    try {
      await pagosService.deletePago(pagoId);
      setPagos(pagos.filter(p => p.id !== pagoId));
      setPagosRecibo(pagosRecibo.filter(p => p.id !== pagoId));
      toast.success('Pago eliminado correctamente');
    } catch (err) {
      toast.error('Error al eliminar el pago');
      console.error('Error eliminando pago:', err);
    }
  };



  // Calcular totales generales
  const getTotalesGenerales = () => {
    const totalImportes = recibosFiltrados.reduce((total, recibo) => total + Number(recibo.importe), 0);
    const totalPagado = recibosFiltrados.reduce((total, recibo) => total + getTotalPagado(recibo.id), 0);
    const totalPendiente = totalImportes - totalPagado;
    const porcentajePagado = totalImportes > 0 ? (totalPagado / totalImportes) * 100 : 0;
    
    return {
      totalImportes,
      totalPagado,
      totalPendiente,
      porcentajePagado,
      cantidadRecibos: recibosFiltrados.length,
      recibosPagados: recibosFiltrados.filter(r => isReciboPagado(r)).length
    };
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
        
          <Button onClick={modalAgregarRecibo.openModal}>
            Agregar Recibo Manual
          </Button>
          {recibos?.length > 0 && (
            <Button 
              onClick={() => {
                setMostrandoRecibos(!mostrandoRecibos)
                !mostrandoRecibos && setTimeout(() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 20);
              }}
            >
              {mostrandoRecibos ? 'Ocultar Recibos' : `Imprimir Recibos (${recibos.length})`}
            </Button>
          )}
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar recibos
            </label>
            <InputField
              placeholder="Buscar por nombre, dirección o concepto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Filtrar por zona
            </label>
            <Select
              defaultValue={zonaFiltro}
              onChange={(value) => typeof value === 'string' ? setZonaFiltro(value) : setZonaFiltro('')}
              options={zonas.map(zona => ({ value: zona, label: zona }))}
              placeholder="Todas las zonas"
            />
          </div>
        </div>
      </div>
      
      {/* Filtros rápidos y botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Filtros rápidos */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setEstadoPagoFiltro('')}
            variant={estadoPagoFiltro === '' ? "primary" : "outline"}
            size="sm"
          >
            Todos ({recibosDB.length})
          </Button>
          <Button
            onClick={() => setEstadoPagoFiltro('pendiente')}
            variant={estadoPagoFiltro === 'pendiente' ? "primary" : "outline"}
            size="sm"
            className={estadoPagoFiltro === 'pendiente' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-600 hover:bg-red-50'}
          >
            Pendientes ({recibosDB.filter(r => !isReciboPagado(r)).length})
          </Button>
          <Button
            onClick={() => setEstadoPagoFiltro('pagado')}
            variant={estadoPagoFiltro === 'pagado' ? "primary" : "outline"}
            size="sm"
            className={estadoPagoFiltro === 'pagado' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-600 hover:bg-green-50'}
          >
            Pagados ({recibosDB.filter(r => isReciboPagado(r)).length})
          </Button>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button 
            onClick={agregarTodosLosRecibos}
            variant="outline"
            size="sm"
            className="px-4 py-2 text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
          >
            Agregar todos los recibos
          </Button>
          {recibos?.length > 0 && <Button 
            onClick={limpiarRecibos}
            variant="outline"
            size="sm"
            className="px-4 py-2 text-sm font-medium border-red-600 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            Limpiar Recibos
          </Button>}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(busqueda || zonaFiltro || estadoPagoFiltro) && (
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
            {estadoPagoFiltro && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Estado: {estadoPagoFiltro === 'pagado' ? 'Pagados' : 'Pendientes'}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusqueda('');
              setZonaFiltro('');
              setEstadoPagoFiltro('');
            }}
            className="text-xs"
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Panel de Resumen */}
      {recibosFiltrados.length > 0 && (() => {
        const totales = getTotalesGenerales();
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Recibos */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Recibos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totales.cantidadRecibos}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {totales.recibosPagados} pagados
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/30">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Importes */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total a Cobrar
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totales.totalImportes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Importe total
                  </p>
                </div>
                <div className="rounded-full bg-orange-50 p-3 dark:bg-orange-900/30">
                  <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Pagado */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Cobrado
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totales.totalPagado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {totales.porcentajePagado.toFixed(1)}% del total
                  </p>
                </div>
                <div className="rounded-full bg-green-50 p-3 dark:bg-green-900/30">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Pendiente */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pendiente
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {totales.totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Por cobrar
                  </p>
                </div>
                <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/30">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Barra de Progreso Visual */}
      {recibosFiltrados.length > 0 && (() => {
        const totales = getTotalesGenerales();
        return (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso de Cobros
              </h4>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {totales.porcentajePagado.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${Math.min(totales.porcentajePagado, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 €</span>
              <span>{totales.totalImportes.toFixed(2)} €</span>
            </div>
          </div>
        );
      })()}

      {/* Tabla de Recibos Generados */}
      {recibos.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recibos Generados
              </h4>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
                {recibos.length} recibos
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[50vh]">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">ID</TableCell>
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Nombre</TableCell>
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Dirección</TableCell>
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Zona</TableCell>
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Importe</TableCell>
                      <TableCell isHeader className="p-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Acciones</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recibos.map((recibo, index) => (
                      <TableRow 
                        key={recibo.id}
                        className={`group transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-800 ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                        }`}
                      >
                        <TableCell className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                              <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
                                {recibo.id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <InputField
                            value={recibo.nombre}
                            onChange={(e) => actualizarRecibo(recibo.id, 'nombre', e.target.value)}
                            className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 dark:focus:border-blue-500 transition-colors"
                            placeholder="Nombre del socio"
                          />
                        </TableCell>
                        <TableCell className="p-3">
                          <InputField
                            value={recibo.direccion}
                            onChange={(e) => actualizarRecibo(recibo.id, 'direccion', e.target.value)}
                            className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 dark:focus:border-blue-500 transition-colors"
                            placeholder="Dirección"
                          />
                        </TableCell>
                        <TableCell className="p-3">
                          <InputField
                            value={recibo.zona}
                            onChange={(e) => actualizarRecibo(recibo.id, 'zona', e.target.value)}
                            className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 dark:focus:border-blue-500 transition-colors"
                            placeholder="Zona"
                          />
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="relative">
                            <InputField
                              type="number"
                              value={recibo.importe || ''}
                              onChange={(e) => actualizarRecibo(recibo.id, 'importe', parseFloat(e.target.value) || 0)}
                              className="text-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400 dark:focus:border-blue-500 transition-colors pr-8"
                              placeholder="0.00"
                              step="0.01"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <button
                            onClick={() => eliminarRecibo(recibo.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
            
            <div className="overflow-x-auto overflow-y-auto h-[60vh]">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-50 dark:border-gray-800">
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Socio</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Importe (€)</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Pagado (€)</TableCell>
                    <TableCell isHeader className="p-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</TableCell>
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
                          {recibo?.importe ? Number(recibo.importe) : '0.00'} €
                        </TableCell>
                        <TableCell className="p-2 text-sm font-medium text-gray-900 dark:text-white">
                          {getTotalPagado(recibo.id)} €
                        </TableCell>
                        <TableCell className="p-2">
                          {isReciboPagado(recibo) ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Pagado
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Pendiente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="p-2 text-sm text-gray-600 dark:text-gray-300">
                          {recibo.concepto}
                        </TableCell>
                        
                        <TableCell className="p-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            <button
                              onClick={() => abrirAgregarPago(recibo)}
                              className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            >
                              + Pago
                            </button>
                            <button
                              onClick={() => verPagosRecibo(recibo)}
                              className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                            >
                              Ver Pagos
                            </button>
                            <button
                              onClick={() => abrirEditarRecibo(recibo)}
                              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarRecibo(recibo.id.toString())}
                              className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 flex flex-col items-center ">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Vista Previa de Recibos
          </h3>
          <RecibosCabalgatas papeleta={recibos.map(recibo => {
            const nombre = socios.find(s => s.id === parseInt(recibo.socioId || '0'))?.nombre;
            
            return ({
            id: recibo.id,
            nombre: nombre || '',
            direccion: recibo.direccion,
            zona: recibo.zona,
            importe: recibo.importe || 0
          })})} />
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

      {/* Modal para agregar pago */}
      <Modal isOpen={modalAgregarPago.isOpen} onClose={modalAgregarPago.closeModal}>
        <div className="p-6 sm:p-8 max-w-md mx-auto">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Agregar Pago a Recibo #{reciboSeleccionado?.id}
          </h3>
          
          {reciboSeleccionado && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {socios.find(s => s.id === reciboSeleccionado?.socio_id)?.nombre}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Importe: {reciboSeleccionado?.importe} €
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Pagado: {getTotalPagado(reciboSeleccionado?.id)} €
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Pendiente: {(reciboSeleccionado?.importe - Number(getTotalPagado(reciboSeleccionado?.id)))} €
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); agregarPago(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad (€) *
              </label>
              <InputField
                type="number"
                placeholder="0.00"
                value={nuevoPago.cantidad}
                onChange={(e) => setNuevoPago({
                  ...nuevoPago, 
                  cantidad: parseFloat(e.target.value)
                })}
                step={0.01}
                max={reciboSeleccionado ? (Number(reciboSeleccionado.importe) - getTotalPagado(reciboSeleccionado.id)).toString() : undefined}
                required={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Pago *
              </label>
              <InputField
                type="date"
                value={nuevoPago.fecha_pago}
                onChange={(e) => setNuevoPago({
                  ...nuevoPago, 
                  fecha_pago: e.target.value
                })}
                required={true}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Agregar Pago
              </Button>
              <Button type="button" variant="outline" onClick={modalAgregarPago.closeModal}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para ver pagos */}
      <Modal isOpen={modalVerPagos.isOpen} onClose={modalVerPagos.closeModal}>
        <div className="p-6 sm:p-8 max-w-2xl mx-auto">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Pagos del Recibo #{reciboSeleccionado?.id}
          </h3>
          
          {reciboSeleccionado && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Socio:</span>
                  <div className="text-gray-600 dark:text-gray-300">
                    {socios.find(s => s.id === reciboSeleccionado?.socio_id)?.nombre}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Concepto:</span>
                  <div className="text-gray-600 dark:text-gray-300">
                    {reciboSeleccionado?.concepto}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Importe Total:</span>
                  <div className="text-gray-600 dark:text-gray-300">
                    {reciboSeleccionado?.importe} €
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Total Pagado:</span>
                  <div className="text-gray-600 dark:text-gray-300">
                    {getTotalPagado(reciboSeleccionado?.id)} €
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {pagosRecibo.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Historial de Pagos ({pagosRecibo.length})
              </h4>
              <div className="space-y-2">
                {pagosRecibo.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {pago.cantidad} €
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarPago(pago.id)}
                      className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                No hay pagos registrados para este recibo
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-6">
            <Button onClick={modalVerPagos.closeModal} className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

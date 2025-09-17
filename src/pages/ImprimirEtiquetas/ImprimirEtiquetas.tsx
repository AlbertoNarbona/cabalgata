import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import {
  sociosService,
  parientesService,
  type Socio,
  type Pariente,
} from '../../services/sociosService';
import { EtiquetasPDF } from './EtiquetasPDF';

export default function ImprimirEtiquetas() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [sociosSeleccionados, setSociosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarPreview, setMostrarPreview] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sociosData, parientesData] = await Promise.all([
        sociosService.getSocios(),
        parientesService.getParientes(),
      ]);
      setSocios(sociosData);
      setParientes(parientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSocio = (id: number) => {
    setSociosSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((socioId) => socioId !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    const sociosFiltrados = sociosFiltradosMemo;
    if (sociosSeleccionados.length === sociosFiltrados.length) {
      setSociosSeleccionados([]);
    } else {
      setSociosSeleccionados(sociosFiltrados.map((socio) => socio.id));
    }
  };

  const sociosFiltradosMemo = React.useMemo(() => {
    if (!busqueda) return socios;

    const termino = busqueda.toLowerCase();
    return socios.filter(
      (socio) =>
        socio.nombre.toLowerCase().includes(termino) ||
        socio.direccion.toLowerCase().includes(termino) ||
        socio.id.toString().includes(termino) ||
        socio.poblacion.toLowerCase().includes(termino)
    );
  }, [socios, busqueda]);

  // Combinar socios con sus parientes
  const sociosConParientes = socios.map((socio) => ({
    ...socio,
    parientes: parientes.filter((pariente) => pariente.socio_id === socio.id),
  }));

  const sociosParaEtiquetas = sociosConParientes.filter((socio) =>
    sociosSeleccionados.includes(socio.id)
  );

  // Calcular el total de etiquetas (socios + parientes)
  const totalEtiquetas = sociosParaEtiquetas.reduce(
    (total, socio) => total + 1 + socio.parientes.length,
    0
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Imprimir Etiquetas
        </h3>
        <div className="flex gap-2">
          {sociosSeleccionados.length > 0 && (
            <button
              onClick={() => setMostrarPreview(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Vista Previa ({totalEtiquetas} etiquetas)
            </button>
          )}
          {mostrarPreview && (
            <button
              onClick={() => setMostrarPreview(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
              Cerrar Preview
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda y controles */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, dirección, ID o población..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={seleccionarTodos}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
            {sociosSeleccionados.length === sociosFiltradosMemo.length
              ? 'Deseleccionar'
              : 'Seleccionar'}{' '}
            Todos
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {sociosSeleccionados.length} socios seleccionados de{' '}
          {sociosFiltradosMemo.length} mostrados
          {sociosSeleccionados.length > 0 &&
            ` → ${totalEtiquetas} etiquetas totales (incluyendo parientes)`}
        </p>
      </div>

      {/* Vista previa del PDF */}
      {mostrarPreview && sociosSeleccionados.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
            Vista Previa del PDF - {totalEtiquetas} etiquetas
          </h4>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <PDFViewer
              width="100%"
              height="600px"
              style={{ width: '100%', height: '600px' }}>
              <EtiquetasPDF sociosConParientes={sociosParaEtiquetas} />
            </PDFViewer>
          </div>
        </div>
      )}

      {/* Lista de socios - Solo mostrar si no está en modo preview */}
      {!mostrarPreview && (
        <>
          {/* Lista de socios */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="max-h-96 overflow-y-auto">
              {sociosFiltradosMemo.map((socio) => {
                const parientesSocio = parientes.filter(
                  (p) => p.socio_id === socio.id
                );

                return (
                  <div
                    key={socio.id}
                    className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                      sociosSeleccionados.includes(socio.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => toggleSocio(socio.id)}>
                    <input
                      type="checkbox"
                      checked={sociosSeleccionados.includes(socio.id)}
                      onChange={() => toggleSocio(socio.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{socio.id} - {socio.nombre}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {1 + parientesSocio.length} etiquetas
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {socio.direccion}, {socio.zona}
                      </div>
                      {parientesSocio.length > 0 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Parientes:{' '}
                          {parientesSocio.map((p) => p.nombre).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {sociosFiltradosMemo.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron socios que coincidan con la búsqueda
            </div>
          )}
        </>
      )}
    </div>
  );
}

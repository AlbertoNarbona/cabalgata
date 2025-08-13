import React, { useState, useEffect } from "react";
import { Socio, Pariente } from "../../services/sociosService";
import InputField from "../form/input/InputField";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";

interface SocioExpandedInfoProps {
  socio: Socio;
  parientes: Pariente[];
  onVerParientes: (socio: Socio) => void;
  onImprimirEtiqueta: (socio: Socio) => void;
  onEliminarSocio: (id: number) => void;
  onActualizarSocio: (socio: Socio) => void;
}

export default function SocioExpandedInfo({
  socio,
  parientes,
  onVerParientes,
  onImprimirEtiqueta,
  onEliminarSocio,
  onActualizarSocio
}: SocioExpandedInfoProps) {
  const [socioEditado, setSocioEditado] = useState<Socio>(socio);
  const [guardando, setGuardando] = useState(false);
  const [hayCambios, setHayCambios] = useState(false);

  const obtenerParientes = (socioId: number) => {
    return parientes.filter(p => p.socio_id === socioId);
  };

  // Detectar cambios comparando el socio original con el editado
  useEffect(() => {
    const cambios = Object.keys(socio).some(key => {
      const campo = key as keyof Socio;
      return socio[campo] !== socioEditado[campo];
    });
    setHayCambios(cambios);
  }, [socio, socioEditado]);

  // Actualizar socioEditado cuando cambie el socio prop
  useEffect(() => {
    setSocioEditado(socio);
  }, [socio]);

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await onActualizarSocio(socioEditado);
      setHayCambios(false);
      toast.success('Socio actualizado correctamente');
    } catch (error) {
      toast.error('Error al guardar el socio');
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setSocioEditado(socio);
    setHayCambios(false);
  };

  const handleInputChange = (campo: keyof Socio, valor: string) => {
    setSocioEditado(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
      {/* Encabezado con información principal */}
      <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{socio.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <InputField
                value={socioEditado.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="text-xl font-bold bg-white"
                placeholder="Nombre del socio"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Socio #{socio.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              
              <span className="text-sm text-gray-700 dark:text-gray-400 mr-2">Fecha de Alta</span>

              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <InputField
                type="date"
                value={socioEditado.fecha_alta ? new Date(socioEditado.fecha_alta).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('fecha_alta', e.target.value)}
                className="text-sm bg-white"
              />
            </div>
            {hayCambios && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Cambios pendientes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de información organizada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Información de contacto - Columna principal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información de Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <InputField
                  type="tel"
                  value={socioEditado.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Teléfono"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <InputField
                  type="email"
                  value={socioEditado.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Correo electrónico"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-300">{obtenerParientes(socio.id).length} parientes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de dirección */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Dirección y Ubicación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Dirección</label>
                <InputField
                  value={socioEditado.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Zona</label>
                <InputField
                  value={socioEditado.zona}
                  onChange={(e) => handleInputChange('zona', e.target.value)}
                  placeholder="Zona"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Código Postal</label>
                <InputField
                  value={socioEditado.codigo_postal}
                  onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                  placeholder="Código postal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Población</label>
                <InputField
                  value={socioEditado.poblacion}
                  onChange={(e) => handleInputChange('poblacion', e.target.value)}
                  placeholder="Población"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Provincia</label>
                <InputField
                  value={socioEditado.provincia}
                  onChange={(e) => handleInputChange('provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Acciones Disponibles</h4>
        <div className="flex flex-wrap gap-3">
          {hayCambios ? (
            <>
              <Button 
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {guardando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancelar}
                disabled={guardando}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onVerParientes(socio); }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver Parientes ({obtenerParientes(socio.id).length})
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onImprimirEtiqueta(socio); }}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Etiqueta
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEliminarSocio(socio.id); }}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from "react";
import InputField from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Socio } from "../../services/sociosService";

interface SearchSociosProps {
  socios: Socio[];
  onSearchResults: (results: Socio[]) => void;
  onClearSearch: () => void;
}

export default function SearchSocios({ socios, onSearchResults, onClearSearch }: SearchSociosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<"nombre" | "email" | "telefono" | "poblacion" | "provincia" | "zona" | "todos">("todos");
  const [isSearching, setIsSearching] = useState(false);

  // Función para realizar la búsqueda
  const realizarBusqueda = () => {
    if (!searchTerm.trim()) {
      onClearSearch();
      return;
    }

    setIsSearching(true);
    
    const termino = searchTerm.toLowerCase().trim();
    let resultados: Socio[] = [];

    switch (searchField) {
      case "nombre":
        resultados = socios.filter(socio => 
          socio.nombre.toLowerCase().includes(termino)
        );
        break;
      case "email":
        resultados = socios.filter(socio => 
          socio.email && socio.email.toLowerCase().includes(termino)
        );
        break;
      case "telefono":
        resultados = socios.filter(socio => 
          socio.telefono && socio.telefono.includes(termino)
        );
        break;
      case "poblacion":
        resultados = socios.filter(socio => 
          socio.poblacion && socio.poblacion.toLowerCase().includes(termino)
        );
        break;
      case "provincia":
        resultados = socios.filter(socio => 
          socio.provincia && socio.provincia.toLowerCase().includes(termino)
        );
        break;
      case "zona":
        resultados = socios.filter(socio => 
          socio.zona && socio.zona.toLowerCase().includes(termino)
        );
        break;
      case "todos":
        resultados = socios.filter(socio => 
          socio.nombre.toLowerCase().includes(termino) ||
          (socio.email && socio.email.toLowerCase().includes(termino)) ||
          (socio.telefono && socio.telefono.includes(termino)) ||
          (socio.direccion && socio.direccion.toLowerCase().includes(termino)) ||
          (socio.poblacion && socio.poblacion.toLowerCase().includes(termino)) ||
          (socio.provincia && socio.provincia.toLowerCase().includes(termino)) ||
          (socio.zona && socio.zona.toLowerCase().includes(termino))
        );
        break;
    }

    onSearchResults(resultados);
    setIsSearching(false);
  };

  // Búsqueda automática al escribir (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        realizarBusqueda();
      } else {
        onClearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchField]);

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
    onClearSearch();
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
     
      <div className="space-y-4">
        {/* Campo de búsqueda */}
        <div className="flex gap-3">
          <div className="flex-1">
            <InputField
              placeholder="Buscar socios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Selector de campo */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as "nombre" | "email" | "telefono" | "todos")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="todos">Todos los campos</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="telefono">Teléfono</option>
            <option value="poblacion">Población</option>
            <option value="provincia">Provincia</option>
            <option value="zona">Zona</option>
          </select>

          {/* Botón limpiar */}
          {searchTerm && (
            <Button
              variant="outline"
              onClick={limpiarBusqueda}
              className="whitespace-nowrap"
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Indicador de búsqueda */}
        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            Buscando...
          </div>
        )}

        {/* Información de resultados */}
        {searchTerm && !isSearching && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Buscando en: <span className="font-medium">{searchField === "todos" ? "Todos los campos" : searchField}</span>
          </div>
        )}
      </div>
    </div>
  );
} 
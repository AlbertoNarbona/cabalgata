import { useState, useRef, useEffect } from 'react';
import { PDFViewer, Document, Page, Text, Image } from '@react-pdf/renderer';
import { documentos } from './documentos';



const DocumentoCombinado = ({
  documentosSeleccionados,
  socio,
  dni,
  pariente,
  firmaDataURL,
}: {
  documentosSeleccionados: string[];
  socio: string;
  dni: string;
  pariente: string;
  firmaDataURL: string;
}) => (
  <Document>
    {documentos({socio, dni, pariente})
      .filter((doc) => documentosSeleccionados.includes(doc.id))
      .map((doc) => (
        <Page
          key={doc.id}
          style={{ width: '100%', height: '100%', padding: 60 }}>
          <Text
            style={{
              fontSize: 24,
              marginBottom: 20,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            {doc.nombre}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}>
            {doc.contenido}
          </Text>

          {/* Pie del documento específico */}
          {doc.footer && (
            <Text style={{ fontSize: 12, marginTop: 20, lineHeight: 1.5 }}>
              {doc.footer}
            </Text>
          )}
          
          {/* Espacio para la firma */}
          <Text style={{ 
            marginTop: 40, 
            marginBottom: 10, 
            fontSize: 14,
            fontWeight: 'bold'
          }}>
            FIRMA:
          </Text>
          
          {/* Firma digital o línea para firmar */}
          {firmaDataURL ? (
            <Image 
              src={firmaDataURL} 
              style={{ 
                width: 150, 
                height: 40, 
                marginBottom: 15,
                border: '1px solid #000'
              }} 
            />
          ) : (
            <Text style={{ 
              marginBottom: 15,
              borderBottom: '1px solid #000',
              paddingBottom: 30,
              fontSize: 12,
              color: '#666'
            }}>
              (Espacio para firmar)
            </Text>
          )}
          
          {/* Información del firmante si está disponible */}
          {(socio || dni || pariente) && (
            <Text style={{ fontSize: 13, marginBottom: 20 }}>
              {socio && `Nombre: ${socio}`}
              {socio && dni && ' | '}
              {dni && `DNI: ${dni}`}
              {(socio || dni) && pariente && ' | '}
              {pariente && `Menor/Pariente: ${pariente}`}
            </Text>
          )}
          
          
          
          
        </Page>
      ))}
  </Document>
);

export default function DocumentosFirmar() {
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<
    string[]
  >([]);
  const [socio, setSocio] = useState('');
  const [dni, setDni] = useState('');
  const [pariente, setPariente] = useState('');
  const [firmaDataURL, setFirmaDataURL] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const toggleDocumento = (id: string) => {
    setDocumentosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
      setFirmaDataURL(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFirmaDataURL('');
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Documentos a Firmar
      </h3>

      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">
          Información del firmante:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-white/60 mb-1">
              Nombre del socio/padre/tutor:
            </label>
            <input
              type="text"
              value={socio}
              onChange={(e) => setSocio(e.target.value)}
              placeholder="Escriba el nombre completo"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-white/60 mb-1">
              DNI:
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="12345678X"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-white/60 mb-1">
              Nombre del menor/pariente:
            </label>
            <input
              type="text"
              value={pariente}
              onChange={(e) => setPariente(e.target.value)}
              placeholder="Nombre del menor (si aplica)"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            /> 
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30 flex flex-col items-center">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">
          Firma digital:
        </h4>
        <div className="inline-block border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 p-2">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border border-gray-200 dark:border-gray-700 rounded cursor-crosshair touch-none w-full max-w-[500px] h-[200px] xl:h-[250px]"
            style={{ touchAction: 'none' }}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={clearSignature}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Limpiar Firma
            </button>
            {firmaDataURL && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                ✓ Firma guardada
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Haga clic y arrastre para firmar en el recuadro
        </p>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">
          Seleccionar documentos:
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {documentos({socio, dni, pariente}).map((doc) => (
            <label
              key={doc.id}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <input
                type="checkbox"
                checked={documentosSeleccionados.includes(doc.id)}
                onChange={() => toggleDocumento(doc.id)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-white/70">
                {doc.nombre}
              </span>
            </label>
          ))}
        </div>
      </div>

      {documentosSeleccionados.length > 0 && (
        <div className="h-[70vh]">
          <PDFViewer width="100%" height="100%">
            <DocumentoCombinado
              documentosSeleccionados={documentosSeleccionados}
              socio={socio}
              dni={dni}
              pariente={pariente}
              firmaDataURL={firmaDataURL}
            />
          </PDFViewer>
        </div>
      )}

      {documentosSeleccionados.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-white/50">
          Selecciona uno o más documentos para visualizarlos
        </div>
      )}
    </div>
  );
}

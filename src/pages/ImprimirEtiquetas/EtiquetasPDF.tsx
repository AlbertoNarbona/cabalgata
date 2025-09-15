import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { logoBase64 } from '../../utils/papeletasSitio';
import { Pariente, Socio } from '../../services/papeletasService';

// Interfaz para socio con parientes
interface SocioConParientes extends Socio {
    parientes: Pariente[];
  }
  
// Estilos para etiquetas
const styleLabel = {
  width: '1.9cm',
  minWidth: '1.9cm',
};

const styleContent = {
  width: '8cm',
};

export const EtiquetasPDF: React.FC<{ sociosConParientes: SocioConParientes[] }> = ({ sociosConParientes }) => {
    // Crear array con socio principal y cada pariente como entradas separadas
    const etiquetas = sociosConParientes.flatMap(socio => {
      const etiquetaSocio = {
        id: socio.id,
        nombre: socio.nombre,
        direccion: socio.direccion,
        codigo_postal: socio.codigo_postal,
        poblacion: socio.poblacion,
        zona: socio.zona,
        tipo: 'socio' as const,
        pariente: null
      };
  
      const etiquetasParientes = socio.parientes.map(pariente => ({
        id: socio.id,
        nombre: socio.nombre,
        direccion: socio.direccion,
        codigo_postal: socio.codigo_postal,
        poblacion: socio.poblacion,
        zona: socio.zona,
        tipo: 'pariente' as const,
        pariente: pariente.nombre
      }));
  
      return [etiquetaSocio, ...etiquetasParientes];
    });
  
    return (
      <Document>
        <Page
          size="A4"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {etiquetas.map((etiqueta, index) => (
            <View
              key={`${etiqueta.id}-${index}`}
              style={{
                width: '10.5cm',
                height: '14cm',
                marginBottom: '0.5cm',
                transform: 'rotate(90deg)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontSize: 9,
              }}>
              <View
                style={{
                  display: 'flex',
                  transform: 'rotate(270deg)',
                  alignItems: 'center',
                }}>
                <Image
                  src={logoBase64}
                  style={{
                    width: 130,
                    height: 60,
                  }}
                />
              </View>
              <View
                style={{ width: '10cm', marginLeft: '0.6cm', lineHeight: 0.9 }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ 
                    fontSize: 11, 
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                    Etiqueta de {etiqueta.tipo === 'socio' ? 'Socio' : 'Pariente'}
                  </Text>
                </View>
                
                <View
                  style={{
                    marginTop: '0.8cm',
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                  <Text style={styleLabel}>Socio:</Text>
                  <Text style={styleContent}>
                    #{etiqueta.id} - {etiqueta.nombre?.toUpperCase()}
                  </Text>
                </View>
  
                {etiqueta.tipo === 'pariente' && (
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text style={styleLabel}>Pariente:</Text>
                    <Text style={styleContent}>{etiqueta.pariente}</Text>
                  </View>
                )}
  
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Text style={styleLabel}>Dirección:</Text>
                  <Text style={styleContent}>{etiqueta.direccion}</Text>
                </View>
  
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Text style={styleLabel}>Zona:</Text>
                  <Text style={styleContent}>{etiqueta.zona}</Text>
                </View>
              </View>
            </View>
          ))}
        </Page>
      </Document>
    );
  };
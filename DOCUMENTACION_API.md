# Documentación Completa de APIs y Componentes

## Tabla de Contenidos

1. [Información General del Proyecto](#información-general-del-proyecto)
2. [Componentes UI](#componentes-ui)
3. [Componentes de Formularios](#componentes-de-formularios)
4. [Componentes de Autenticación](#componentes-de-autenticación)
5. [Componentes de Gráficos](#componentes-de-gráficos)
6. [Componentes de Comercio Electrónico](#componentes-de-comercio-electrónico)
7. [Componentes Comunes](#componentes-comunes)
8. [Hooks Personalizados](#hooks-personalizados)
9. [Contextos](#contextos)
10. [Páginas](#páginas)
11. [Utilidades](#utilidades)

---

## Información General del Proyecto

**Nombre:** tailadmin-react  
**Versión:** 2.0.1  
**Tecnologías:** React 18, TypeScript, Tailwind CSS, Vite

### Dependencias Principales
- React 18.3.1
- TypeScript 5.7.2
- Tailwind CSS 4.0.8
- React Router 7.1.5
- ApexCharts 4.1.0
- FullCalendar 6.1.15

---

## Componentes UI

### Button

Componente de botón reutilizable con múltiples variantes y tamaños.

```tsx
import Button from './components/ui/button/Button';

// Uso básico
<Button onClick={() => console.log('clicked')}>
  Hacer clic
</Button>

// Con iconos
<Button 
  startIcon={<IconComponent />}
  endIcon={<IconComponent />}
  variant="outline"
  size="sm"
>
  Botón con iconos
</Button>
```

**Props:**
- `children: ReactNode` - Contenido del botón
- `size?: "sm" | "md"` - Tamaño del botón (por defecto: "md")
- `variant?: "primary" | "outline"` - Variante del botón (por defecto: "primary")
- `startIcon?: ReactNode` - Icono antes del texto
- `endIcon?: ReactNode` - Icono después del texto
- `onClick?: () => void` - Manejador de clic
- `disabled?: boolean` - Estado deshabilitado (por defecto: false)
- `className?: string` - Clases CSS adicionales

### Alert

Componente de alerta para mostrar mensajes informativos, de éxito, error o advertencia.

```tsx
import Alert from './components/ui/alert/Alert';

// Alerta de éxito
<Alert
  variant="success"
  title="Operación exitosa"
  message="Los datos se han guardado correctamente."
/>

// Alerta con enlace
<Alert
  variant="warning"
  title="Atención requerida"
  message="Debe completar todos los campos obligatorios."
  showLink={true}
  linkHref="/ayuda"
  linkText="Ver ayuda"
/>
```

**Props:**
- `variant: "success" | "error" | "warning" | "info"` - Tipo de alerta
- `title: string` - Título de la alerta
- `message: string` - Mensaje de la alerta
- `showLink?: boolean` - Mostrar enlace (por defecto: false)
- `linkHref?: string` - URL del enlace (por defecto: "#")
- `linkText?: string` - Texto del enlace (por defecto: "Learn more")

### Avatar

Componente de avatar para mostrar imágenes de perfil de usuario.

```tsx
import Avatar from './components/ui/avatar/Avatar';

// Avatar básico
<Avatar 
  src="/path/to/image.jpg" 
  alt="Foto de perfil"
/>

// Avatar con estado
<Avatar 
  src="/path/to/image.jpg" 
  alt="Foto de perfil"
  size="large"
  status="online"
/>
```

**Props:**
- `src: string` - URL de la imagen del avatar
- `alt?: string` - Texto alternativo
- `size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge"` - Tamaño del avatar
- `status?: "online" | "offline" | "busy" | "none"` - Indicador de estado

### Badge

Componente de insignia para mostrar etiquetas o estados.

```tsx
import Badge from './components/ui/badge/Badge';

// Badge básico
<Badge color="success">Activo</Badge>

// Badge con iconos
<Badge 
  variant="solid"
  color="warning"
  startIcon={<WarningIcon />}
  endIcon={<ArrowIcon />}
>
  Pendiente
</Badge>
```

**Props:**
- `variant?: "light" | "solid"` - Variante del badge
- `size?: BadgeSize` - Tamaño del badge
- `color?: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"` - Color del badge
- `startIcon?: React.ReactNode` - Icono al inicio
- `endIcon?: React.ReactNode` - Icono al final
- `children: React.ReactNode` - Contenido del badge

### Table

Sistema de componentes de tabla modular.

```tsx
import { Table, TableHeader, TableBody, TableRow, TableCell } from './components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableCell isHeader>Nombre</TableCell>
      <TableCell isHeader>Email</TableCell>
      <TableCell isHeader>Estado</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Juan Pérez</TableCell>
      <TableCell>juan@ejemplo.com</TableCell>
      <TableCell>Activo</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Componentes disponibles:**
- `Table` - Contenedor principal de la tabla
- `TableHeader` - Encabezado de la tabla
- `TableBody` - Cuerpo de la tabla
- `TableRow` - Fila de la tabla
- `TableCell` - Celda de la tabla

**Props de TableCell:**
- `children: ReactNode` - Contenido de la celda
- `isHeader?: boolean` - Si es true, renderiza como `<th>`, sino como `<td>`
- `className?: string` - Clases CSS adicionales

### Modal

Componente de modal para mostrar contenido superpuesto.

```tsx
import { Modal } from './components/ui/modal';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  showCloseButton={true}
  isFullscreen={false}
>
  <div className="p-6">
    <h2>Contenido del modal</h2>
    <p>Este es el contenido del modal.</p>
  </div>
</Modal>
```

**Props:**
- `isOpen: boolean` - Estado de apertura del modal
- `onClose: () => void` - Función para cerrar el modal
- `className?: string` - Clases CSS adicionales
- `children: React.ReactNode` - Contenido del modal
- `showCloseButton?: boolean` - Mostrar botón de cerrar (por defecto: true)
- `isFullscreen?: boolean` - Modal de pantalla completa (por defecto: false)

---

## Componentes de Formularios

### InputField

Componente de campo de entrada con múltiples tipos y estados.

```tsx
import InputField from './components/form/input/InputField';

// Campo de texto básico
<InputField
  type="text"
  placeholder="Ingrese su nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Campo con validación
<InputField
  type="email"
  placeholder="Ingrese su email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  hint="Ingrese un email válido"
/>

// Campo numérico
<InputField
  type="number"
  placeholder="Ingrese su edad"
  min="0"
  max="120"
  step="1"
/>
```

**Props:**
- `type?: "text" | "number" | "email" | "password" | "date" | "time" | string` - Tipo de entrada
- `id?: string` - ID del campo
- `name?: string` - Nombre del campo
- `placeholder?: string` - Texto de placeholder
- `value?: string | number` - Valor del campo
- `onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void` - Manejador de cambio
- `className?: string` - Clases CSS adicionales
- `min?: string` - Valor mínimo (para campos numéricos)
- `max?: string` - Valor máximo (para campos numéricos)
- `step?: number` - Incremento (para campos numéricos)
- `disabled?: boolean` - Estado deshabilitado
- `success?: boolean` - Estado de éxito
- `error?: boolean` - Estado de error
- `hint?: string` - Texto de ayuda

### TextArea

Componente de área de texto para entradas multilínea.

```tsx
import TextArea from './components/form/input/TextArea';

<TextArea
  placeholder="Ingrese su mensaje"
  rows={4}
  value={message}
  onChange={(value) => setMessage(value)}
  hint="Máximo 500 caracteres"
/>
```

**Props:**
- `placeholder?: string` - Texto de placeholder
- `rows?: number` - Número de filas
- `value?: string` - Valor actual
- `onChange?: (value: string) => void` - Manejador de cambio
- `className?: string` - Clases CSS adicionales
- `disabled?: boolean` - Estado deshabilitado
- `error?: boolean` - Estado de error
- `hint?: string` - Texto de ayuda

### Select

Componente de selección desplegable.

```tsx
import Select from './components/form/Select';

const options = [
  { value: "option1", label: "Opción 1" },
  { value: "option2", label: "Opción 2" },
  { value: "option3", label: "Opción 3" }
];

<Select
  options={options}
  placeholder="Seleccione una opción"
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
/>
```

**Props:**
- `options: Option[]` - Array de opciones
- `placeholder?: string` - Texto de placeholder
- `onChange: (value: string) => void` - Manejador de cambio
- `className?: string` - Clases CSS adicionales
- `defaultValue?: string` - Valor por defecto

**Interface Option:**
```tsx
interface Option {
  value: string;
  label: string;
}
```

### MultiSelect

Componente de selección múltiple.

```tsx
import MultiSelect from './components/form/MultiSelect';

const options = [
  { value: "tag1", text: "Etiqueta 1" },
  { value: "tag2", text: "Etiqueta 2" },
  { value: "tag3", text: "Etiqueta 3" }
];

<MultiSelect
  options={options}
  selectedValues={selectedTags}
  onChange={(values) => setSelectedTags(values)}
/>
```

**Props:**
- `options: Option[]` - Array de opciones
- `selectedValues: string[]` - Valores seleccionados
- `onChange: (values: string[]) => void` - Manejador de cambio

**Interface Option:**
```tsx
interface Option {
  value: string;
  text: string;
}
```

### Radio

Componente de botón de radio.

```tsx
import Radio from './components/form/input/Radio';

<Radio
  id="option1"
  name="options"
  value="option1"
  checked={selectedOption === "option1"}
  label="Opción 1"
  onChange={(value) => setSelectedOption(value)}
/>
```

**Props:**
- `id: string` - ID único del botón de radio
- `name: string` - Nombre del grupo de radio
- `value: string` - Valor del botón de radio
- `checked: boolean` - Si está seleccionado
- `label: string` - Etiqueta del botón de radio
- `onChange: (value: string) => void` - Manejador de cambio
- `className?: string` - Clases CSS adicionales
- `disabled?: boolean` - Estado deshabilitado

### RadioSm

Versión pequeña del componente de radio.

```tsx
import RadioSm from './components/form/input/RadioSm';

<RadioSm
  id="option1"
  name="options"
  value="option1"
  checked={selectedOption === "option1"}
  label="Opción 1"
  onChange={(value) => setSelectedOption(value)}
/>
```

**Props:** (Igual que Radio)

### Checkbox

Componente de casilla de verificación.

```tsx
import Checkbox from './components/form/input/Checkbox';

<Checkbox
  id="terms"
  checked={acceptedTerms}
  onChange={(checked) => setAcceptedTerms(checked)}
  label="Acepto los términos y condiciones"
/>
```

**Props:**
- `id: string` - ID único del checkbox
- `checked: boolean` - Si está marcado
- `onChange: (checked: boolean) => void` - Manejador de cambio
- `label: string` - Etiqueta del checkbox
- `className?: string` - Clases CSS adicionales
- `disabled?: boolean` - Estado deshabilitado

### Form

Componente contenedor de formulario.

```tsx
import Form from './components/form/Form';

<Form onSubmit={handleSubmit}>
  <InputField name="name" placeholder="Nombre" />
  <InputField name="email" type="email" placeholder="Email" />
  <Button type="submit">Enviar</Button>
</Form>
```

**Props:**
- `onSubmit: (event: FormEvent<HTMLFormElement>) => void` - Manejador de envío
- `children: ReactNode` - Contenido del formulario
- `className?: string` - Clases CSS adicionales

---

## Componentes de Autenticación

### SignInForm

Formulario de inicio de sesión.

```tsx
import SignInForm from './components/auth/SignInForm';

<SignInForm 
  onSubmit={handleSignIn}
  isLoading={loading}
/>
```

### SignUpForm

Formulario de registro.

```tsx
import SignUpForm from './components/auth/SignUpForm';

<SignUpForm 
  onSubmit={handleSignUp}
  isLoading={loading}
/>
```

---

## Componentes de Gráficos

### LineChartOne

Componente de gráfico de líneas usando ApexCharts.

```tsx
import LineChartOne from './components/charts/line/LineChartOne';

<LineChartOne 
  data={chartData}
  title="Ventas Mensuales"
/>
```

### BarChartOne

Componente de gráfico de barras usando ApexCharts.

```tsx
import BarChartOne from './components/charts/bar/BarChartOne';

<BarChartOne 
  data={chartData}
  title="Productos Vendidos"
/>
```

---

## Componentes de Comercio Electrónico

### RecentOrders

Componente para mostrar órdenes recientes.

```tsx
import RecentOrders from './components/ecommerce/RecentOrders';

<RecentOrders orders={ordersData} />
```

**Interface Product:**
```tsx
interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
  status: "Delivered" | "Pending" | "Canceled";
}
```

### EcommerceMetrics

Componente para mostrar métricas de comercio electrónico.

```tsx
import EcommerceMetrics from './components/ecommerce/EcommerceMetrics';

<EcommerceMetrics metrics={metricsData} />
```

### MonthlySalesChart

Gráfico de ventas mensuales.

```tsx
import MonthlySalesChart from './components/ecommerce/MonthlySalesChart';

<MonthlySalesChart data={salesData} />
```

---

## Componentes Comunes

### ComponentCard

Tarjeta contenedora para componentes de demostración.

```tsx
import ComponentCard from './components/common/ComponentCard';

<ComponentCard 
  title="Ejemplo de Componente"
  desc="Descripción del componente"
>
  <Button>Botón de ejemplo</Button>
</ComponentCard>
```

**Props:**
- `title: string` - Título de la tarjeta
- `children: React.ReactNode` - Contenido de la tarjeta
- `className?: string` - Clases CSS adicionales
- `desc?: string` - Descripción del componente

### PageBreadCrumb

Componente de migas de pan para navegación.

```tsx
import PageBreadCrumb from './components/common/PageBreadCrumb';

<PageBreadCrumb 
  items={[
    { label: "Inicio", href: "/" },
    { label: "Usuarios", href: "/users" },
    { label: "Perfil", href: "/users/profile" }
  ]}
/>
```

### PageMeta

Componente para manejar metadatos de página.

```tsx
import PageMeta from './components/common/PageMeta';

<PageMeta 
  title="Mi Página"
  description="Descripción de la página"
/>
```

### ScrollToTop

Componente para hacer scroll al inicio de la página.

```tsx
import { ScrollToTop } from './components/common/ScrollToTop';

<ScrollToTop />
```

### ThemeToggleButton

Botón para alternar entre temas claro y oscuro.

```tsx
import ThemeToggleButton from './components/common/ThemeToggleButton';

<ThemeToggleButton />
```

### ThemeTogglerTwo

Versión alternativa del botón de cambio de tema.

```tsx
import ThemeTogglerTwo from './components/common/ThemeTogglerTwo';

<ThemeTogglerTwo />
```

### ChartTab

Componente de pestañas para gráficos.

```tsx
import ChartTab from './components/common/ChartTab';

<ChartTab 
  tabs={[
    { label: "Ventas", content: <SalesChart /> },
    { label: "Gastos", content: <ExpensesChart /> }
  ]}
/>
```

### GridShape

Componente de forma de cuadrícula decorativa.

```tsx
import GridShape from './components/common/GridShape';

<GridShape />
```

---

## Hooks Personalizados

### useModal

Hook para manejar el estado de modales.

```tsx
import { useModal } from './hooks/useModal';

const { isOpen, openModal, closeModal, toggleModal } = useModal();

// Uso
<Button onClick={openModal}>Abrir Modal</Button>
<Modal isOpen={isOpen} onClose={closeModal}>
  Contenido del modal
</Modal>
```

**Retorna:**
- `isOpen: boolean` - Estado de apertura del modal
- `openModal: () => void` - Función para abrir el modal
- `closeModal: () => void` - Función para cerrar el modal
- `toggleModal: () => void` - Función para alternar el estado del modal

### useGoBack

Hook para navegar hacia atrás en el historial.

```tsx
import useGoBack from './hooks/useGoBack';

const goBack = useGoBack();

// Uso
<Button onClick={goBack}>Volver</Button>
```

**Retorna:**
- `goBack: () => void` - Función para navegar hacia atrás

---

## Contextos

### ThemeContext

Contexto para manejar el tema de la aplicación (claro/oscuro).

```tsx
import { ThemeProvider, useTheme } from './context/ThemeContext';

// En el componente raíz
<ThemeProvider>
  <App />
</ThemeProvider>

// En cualquier componente hijo
const { theme, toggleTheme } = useTheme();

// Uso
<Button onClick={toggleTheme}>
  Cambiar a tema {theme === 'light' ? 'oscuro' : 'claro'}
</Button>
```

**ThemeProvider Props:**
- `children: React.ReactNode` - Componentes hijos

**useTheme retorna:**
- `theme: "light" | "dark"` - Tema actual
- `toggleTheme: () => void` - Función para alternar el tema

### SidebarContext

Contexto para manejar el estado de la barra lateral.

```tsx
import { SidebarProvider, useSidebar } from './context/SidebarContext';

// En el componente raíz
<SidebarProvider>
  <App />
</SidebarProvider>

// En cualquier componente hijo
const { isOpen, toggleSidebar } = useSidebar();
```

---

## Páginas

### Páginas de Autenticación

#### SignIn
```tsx
import SignIn from './pages/AuthPages/SignIn';
// Ruta: /signin
```

#### SignUp
```tsx
import SignUp from './pages/AuthPages/SignUp';
// Ruta: /signup
```

### Páginas de Dashboard

#### Home
```tsx
import Home from './pages/Dashboard/Home';
// Ruta: /
```

### Páginas de Gestión

#### Socios
```tsx
import Socios from './pages/socios/Socios';
// Ruta: /
```

#### Cortejos
```tsx
import Cortejos from './pages/Cortejos/Cortejos';
// Ruta: /cortejos
```

#### Papeletas
```tsx
import Papeletas from './pages/Papeletas/Papeletas';
// Ruta: /papeletas
```

#### Recibos
```tsx
import Recibos from './pages/Recibos/Recibos';
// Ruta: /recibos
```

#### Donaciones
```tsx
import Donaciones from './pages/Donaciones/Donaciones';
// Ruta: /donaciones
```

#### DocumentosFirmar
```tsx
import DocumentosFirmar from './pages/DocumentosFirmar.tsx/DocumentosFirmar';
// Ruta: /documentos
```

#### ImprimirEtiquetas
```tsx
import ImprimirEtiquetas from './pages/ImprimirEtiquetas/ImprimirEtiquetas';
// Ruta: /etiquetas
```

### Páginas de UI Elements

#### Alerts
```tsx
import Alerts from './pages/UiElements/Alerts';
// Ruta: /alerts
```

#### Avatars
```tsx
import Avatars from './pages/UiElements/Avatars';
// Ruta: /avatars
```

#### Badges
```tsx
import Badges from './pages/UiElements/Badges';
// Ruta: /badge
```

#### Buttons
```tsx
import Buttons from './pages/UiElements/Buttons';
// Ruta: /buttons
```

#### Images
```tsx
import Images from './pages/UiElements/Images';
// Ruta: /images
```

#### Videos
```tsx
import Videos from './pages/UiElements/Videos';
// Ruta: /videos
```

### Páginas de Gráficos

#### LineChart
```tsx
import LineChart from './pages/Charts/LineChart';
// Ruta: /line-chart
```

#### BarChart
```tsx
import BarChart from './pages/Charts/BarChart';
// Ruta: /bar-chart
```

### Otras Páginas

#### Calendar
```tsx
import Calendar from './pages/Calendar';
// Ruta: /calendar
```

#### BasicTables
```tsx
import BasicTables from './pages/Tables/BasicTables';
// Ruta: /basic-tables
```

#### FormElements
```tsx
import FormElements from './pages/Forms/FormElements';
// Ruta: /form-elements
```

#### UserProfiles
```tsx
import UserProfiles from './pages/UserProfiles';
// Ruta: /profile
```

#### Blank
```tsx
import Blank from './pages/Blank';
// Ruta: /blank
```

#### NotFound
```tsx
import NotFound from './pages/OtherPage/NotFound';
// Ruta: * (fallback)
```

---

## Utilidades

### Configuración de Vite

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
});
```

### Configuración de ESLint

```js
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

### Declaraciones de Tipos

```tsx
// svg.d.ts
declare module "*.svg?react" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
```

---

## Scripts Disponibles

```json
{
  "dev": "vite",                    // Iniciar servidor de desarrollo
  "build": "tsc -b && vite build",  // Construir para producción
  "lint": "eslint .",               // Ejecutar linter
  "preview": "vite preview"         // Vista previa de la build
}
```

---

## Estructura de Archivos

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── charts/         # Componentes de gráficos
│   ├── common/         # Componentes comunes
│   ├── ecommerce/      # Componentes de comercio electrónico
│   ├── form/           # Componentes de formularios
│   ├── header/         # Componentes de encabezado
│   ├── tables/         # Componentes de tablas
│   └── ui/             # Componentes de UI básicos
├── context/            # Contextos de React
├── hooks/              # Hooks personalizados
├── icons/              # Iconos SVG
├── layout/             # Componentes de layout
├── pages/              # Páginas de la aplicación
└── main.tsx           # Punto de entrada
```

---

## Guías de Uso

### Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

### Mejores Prácticas

1. **Uso de TypeScript:** Todos los componentes están tipados con TypeScript para mejor mantenibilidad.

2. **Componentes Reutilizables:** Utilice los componentes UI existentes en lugar de crear nuevos cuando sea posible.

3. **Hooks Personalizados:** Para lógica reutilizable, cree hooks personalizados en la carpeta `hooks/`.

4. **Contextos:** Use contextos para estado global como temas y configuración de la aplicación.

5. **Rutas:** Agregue nuevas rutas en `App.tsx` siguiendo el patrón existente.

### Temas y Estilos

El proyecto utiliza Tailwind CSS para estilos. Los temas claro y oscuro se manejan automáticamente a través del `ThemeContext`.

### Iconos

Los iconos SVG se importan como componentes React usando el plugin `vite-plugin-svgr`.

```tsx
import { ReactComponent as IconName } from './icons/icon-name.svg';
```

---

## Soporte y Contribución

Para reportar bugs o solicitar nuevas características, por favor contacte al equipo de desarrollo.

### Convenciones de Código

- Usar TypeScript para todos los archivos
- Seguir las reglas de ESLint configuradas
- Documentar props de componentes con JSDoc
- Usar nombres descriptivos para variables y funciones
- Mantener componentes pequeños y enfocados

---

*Esta documentación se actualiza regularmente. Para la versión más reciente, consulte el repositorio del proyecto.*
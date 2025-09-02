import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import PageMeta from './components/common/PageMeta';
import { ToastContainer } from 'react-toastify';
import { WebSocketProvider } from './context/WebSocketContext';

// Carga lazy de los componentes
const SignIn = lazy(() => import('./pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('./pages/AuthPages/SignUp'));
const NotFound = lazy(() => import('./pages/OtherPage/NotFound'));
const UserProfiles = lazy(() => import('./pages/UserProfiles'));
const Videos = lazy(() => import('./pages/UiElements/Videos'));
const Images = lazy(() => import('./pages/UiElements/Images'));
const Alerts = lazy(() => import('./pages/UiElements/Alerts'));
const Badges = lazy(() => import('./pages/UiElements/Badges'));
const Avatars = lazy(() => import('./pages/UiElements/Avatars'));
const Buttons = lazy(() => import('./pages/UiElements/Buttons'));
const LineChart = lazy(() => import('./pages/Charts/LineChart'));
const BarChart = lazy(() => import('./pages/Charts/BarChart'));
const Calendar = lazy(() => import('./pages/Calendar'));
const BasicTables = lazy(() => import('./pages/Tables/BasicTables'));
const FormElements = lazy(() => import('./pages/Forms/FormElements'));
const Blank = lazy(() => import('./pages/Blank'));
const Socios = lazy(() => import('./pages/socios/Socios'));
const ImprimirEtiquetas = lazy(
  () => import('./pages/ImprimirEtiquetas/ImprimirEtiquetas')
);
const DocumentosFirmar = lazy(
  () => import('./pages/DocumentosFirmar.tsx/DocumentosFirmar')
);
const Cortejos = lazy(() => import('./pages/Cortejos/Cortejos'));
const Papeletas = lazy(() => import('./pages/Papeletas/Papeletas.tsx'));
const Recibos = lazy(() => import('./pages/Recibos/Recibos.tsx'));

// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <>
      <PageMeta title="ReyeSilos" description="Reyes Silos" />
      <WebSocketProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              {/*<Route index path="/" element={<Home />} />*/}

              {/* Socios */}
              <Route path="/" element={<Socios />} />
              <Route path="/etiquetas" element={<ImprimirEtiquetas />} />

              {/* Secretaría */}
              <Route path="/documentos" element={<DocumentosFirmar />} />
              <Route path="/cortejos" element={<Cortejos />} />
              <Route path="/papeletas" element={<Papeletas />} />

              {/* Tesorería */}
              <Route path="/recibos" element={<Recibos key="recibos" tipo="recibo" />} />
              <Route path="/donaciones" element={<Recibos key="donaciones" tipo="donacion" />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </Router>
      </WebSocketProvider>
      <div className="fixed top-4 right-4 z-[999999]">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}

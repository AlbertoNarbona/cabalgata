import { BrowserRouter as Router, Routes, Route } from 'react-router';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import UserProfiles from './pages/UserProfiles';
import Videos from './pages/UiElements/Videos';
import Images from './pages/UiElements/Images';
import Alerts from './pages/UiElements/Alerts';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import Calendar from './pages/Calendar';
import BasicTables from './pages/Tables/BasicTables';
import FormElements from './pages/Forms/FormElements';
import Blank from './pages/Blank';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Socios from './pages/socios/Socios';
import ImprimirEtiquetas from './pages/ImprimirEtiquetas/ImprimirEtiquetas';
import DocumentosFirmar from './pages/DocumentosFirmar.tsx/DocumentosFirmar';
import Cortejos from './pages/Cortejos/Cortejos';
import Papeletas from './pages/Papeletas/Papeletas';
import Recibos from './pages/Recibos/Recibos';
import Donaciones from './pages/Donaciones/Donaciones';
import PageMeta from './components/common/PageMeta';

export default function App() {
  return (
    <>
      <PageMeta title="ReyeSilos" description="Reyes Silos" />
      <Router>
        <ScrollToTop />
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
            <Route path="/recibos" element={<Recibos />} />
            <Route path="/donaciones" element={<Donaciones />} />

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
      </Router>
    </>
  );
}

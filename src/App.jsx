import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound/NotFound';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from './components/ui/toast';

const HomeLeaderboard = lazy(() => import('./pages/HomeLeaderboard/HomeLeaderboard'));
const ChampionshipsList = lazy(() => import('./pages/Championships/ChampionshipsList'));
const CreateChampionship = lazy(() => import('./pages/Championships/CreateChampionship'));
const EditChampionship = lazy(() => import('./pages/Championships/EditChampionship'));
const ChampionshipDetail = lazy(() => import('./pages/Championships/ChampionshipDetail'));
const TracksList = lazy(() => import('./pages/Tracks/TracksList'));
const CreateTrack = lazy(() => import('./pages/Tracks/CreateTrack'));
const EditTrack = lazy(() => import('./pages/Tracks/EditTrack'));
const TrackDetail = lazy(() => import('./pages/Tracks/TrackDetail'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Auth = lazy(() => import('./pages/Auth/Auth'));
const Live = lazy(() => import('./pages/Live/Live'));
const DesignSystem = lazy(() => import('./pages/DesignSystem/DesignSystem'));

function RouteLoader() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 opacity-85">
      <Loader2 className="animate-spin text-[#FF3100]" size={36} />
      <span className="text-white/60 text-sm font-sans tracking-wide">Cargando circuito...</span>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<HomeLeaderboard />} />

              <Route path="/championships" element={<ChampionshipsList />} />
              <Route path="/championships/new" element={<ProtectedRoute><CreateChampionship /></ProtectedRoute>} />
              <Route path="/championships/edit/:id" element={<ProtectedRoute><EditChampionship /></ProtectedRoute>} />
              <Route path="/championships/:id" element={<ChampionshipDetail />} />

              <Route path="/tracks" element={<TracksList />} />
              <Route path="/tracks/new" element={<ProtectedRoute><CreateTrack /></ProtectedRoute>} />
              <Route path="/tracks/edit/:id" element={<ProtectedRoute><EditTrack /></ProtectedRoute>} />
              <Route path="/tracks/:id" element={<TrackDetail />} />

              <Route path="/live" element={<Live />} />

              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<Auth />} />
              <Route path="/design-system" element={<DesignSystem />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;

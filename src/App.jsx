import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile/Profile';
import TracksList from './pages/Tracks/TracksList';
import TrackDetail from './pages/Tracks/TrackDetail';
import ChampionshipsList from './pages/Championships/ChampionshipsList';
import ChampionshipDetail from './pages/Championships/ChampionshipDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/championships" replace />} />
          
          <Route path="/championships" element={<ChampionshipsList />} />
          <Route path="/championships/:id" element={<ChampionshipDetail />} />
          
          <Route path="/tracks" element={<TracksList />} />
          <Route path="/tracks/:id" element={<TrackDetail />} />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

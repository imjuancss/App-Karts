import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile/Profile';
import TracksList from './pages/Tracks/TracksList';
import TrackDetail from './pages/Tracks/TrackDetail';
import CreateTrack from './pages/Tracks/CreateTrack';
import ChampionshipsList from './pages/Championships/ChampionshipsList';
import ChampionshipDetail from './pages/Championships/ChampionshipDetail';
import CreateChampionship from './pages/Championships/CreateChampionship';
import HomeLeaderboard from './pages/HomeLeaderboard/HomeLeaderboard';
import Auth from './pages/Auth/Auth';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeLeaderboard />} />
          
          <Route path="/championships" element={<ChampionshipsList />} />
          <Route path="/championships/new" element={<CreateChampionship />} />
          <Route path="/championships/:id" element={<ChampionshipDetail />} />
          
          <Route path="/tracks" element={<TracksList />} />
          <Route path="/tracks/new" element={<CreateTrack />} />
          <Route path="/tracks/:id" element={<TrackDetail />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

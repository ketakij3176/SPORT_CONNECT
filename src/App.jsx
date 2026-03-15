import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import Players from './pages/Players';
import Grounds from './pages/Grounds';
import Tournaments from './pages/Tournaments';
import GroundBooking from './pages/GroundBooking';
import TournamentRegistration from './pages/TournamentRegistration';
import PlayerConnection from './pages/PlayerConnection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/players" element={<Players />} />
        <Route path="/grounds" element={<Grounds />} />
        <Route path="/grounds/:id" element={<Grounds />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<Tournaments />} />
        <Route path="/ground-booking/:id" element={<GroundBooking />} />
        <Route path="/tournament-registration/:id" element={<TournamentRegistration />} />
        <Route path="/player-connection/:id" element={<PlayerConnection />} />
      </Routes>
    </BrowserRouter>
  );
}
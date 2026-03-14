import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import DiscoverMap from "./pages/DiscoverMap";
import Clubs from "./pages/Clubs";
import Tournaments from "./pages/Tournaments";
import Grounds from "./pages/Grounds";
import Equipment from "./pages/Equipment";
import Events from "./pages/Events";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/landing" element={<Landing />} />
        <Route path="/discover-map" element={<DiscoverMap />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/grounds" element={<Grounds />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>
  );
}

export default App;
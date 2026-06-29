import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Vehicles from "./pages/Vehicles";
import DepotDossier from "./pages/DepotDossier";
import Dossiers from "./pages/Dossiers";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/vehicles" replace />} />

        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/depot-dossier" element={<DepotDossier />} />
        <Route path="/dossiers" element={<Dossiers />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dossiers" element={<Admin />} />

        <Route path="*" element={<Navigate to="/vehicles" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vehicles from "./pages/Vehicles";
import Dossiers from "./pages/Dossiers";
import DepotDossier from "./pages/DepotDossier";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/vehicles" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/dossiers" element={<Dossiers />} />
          <Route path="/depot-dossier" element={<DepotDossier />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
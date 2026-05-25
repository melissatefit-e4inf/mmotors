import { useState, useEffect } from "react";
import API from "../api/client";

function Dossiers() {
  const [dossiers, setDossiers] = useState([]);

  useEffect(() => {
    API.get("/dossiers/").then((res) => setDossiers(res.data));
  }, []);

  const statusLabel = {
    pending: "En attente",
    validated: "Validé",
    refused: "Refusé"
  };

  return (
    <div>
      <h2>Mes dossiers</h2>
      {dossiers.length === 0 && <p>Aucun dossier pour le moment.</p>}
      {dossiers.map((d) => (
        <div key={d.id} style={{
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "12px"
        }}>
          <p>Dossier #{d.id} — {d.dossier_type === "purchase" ? "Achat" : "Location"}</p>
          <p>Statut : <strong>{statusLabel[d.status]}</strong></p>
        </div>
      ))}
    </div>
  );
}

export default Dossiers;
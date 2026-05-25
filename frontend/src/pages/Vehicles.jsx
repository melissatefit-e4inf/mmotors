import { useState, useEffect } from "react";
import API from "../api/client";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const url = filter ? `/vehicles/?vehicle_type=${filter}` : "/vehicles/";
    API.get(url).then((res) => setVehicles(res.data));
  }, [filter]);

  return (
    <div>
      <h2>Catalogue de véhicules</h2>
      <div style={{ marginBottom: "16px" }}>
        <button onClick={() => setFilter("")}
          style={{ marginRight: "8px", padding: "6px 14px", cursor: "pointer" }}>
          Tous
        </button>
        <button onClick={() => setFilter("sale")}
          style={{ marginRight: "8px", padding: "6px 14px", cursor: "pointer" }}>
          Achat
        </button>
        <button onClick={() => setFilter("rental")}
          style={{ padding: "6px 14px", cursor: "pointer" }}>
          Location
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {vehicles.map((v) => (
          <div key={v.id} style={{
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "16px"
          }}>
            <h3>{v.brand} {v.model}</h3>
            <p>Année : {v.year}</p>
            <p>Kilométrage : {v.mileage} km</p>
            <p>Prix : {v.price} €</p>
            <p>Type : {v.vehicle_type === "sale" ? "Achat" : "Location"}</p>
            {v.description && <p style={{ color: "#64748B" }}>{v.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vehicles;
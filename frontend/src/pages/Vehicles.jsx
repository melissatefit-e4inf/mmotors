import { useState, useEffect } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";


function VehicleCard({ v }) {
  const isRental = v.vehicle_type === "rental";
  const isSale = v.vehicle_type === "sale";
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      <div style={styles.imageWrapper}>
        <img
          src={v.image_url || CAR_PLACEHOLDER(`${v.brand} ${v.model}`)}
          alt={`${v.brand} ${v.model}`}
          style={styles.cardImage}
          onError={(e) => {
            e.target.src = CAR_PLACEHOLDER(`${v.brand} ${v.model}`);
          }}
        />
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTitle}>{v.brand} {v.model}</div>
        <div style={styles.cardPrices}>
          {isSale ? (
            <span style={styles.priceTag}>€{Number(v.price).toLocaleString("fr-FR")}</span>
          ) : (
            <span style={styles.priceTag}>€{v.price}/jour</span>
          )}
        </div>
        <div style={styles.cardMeta}>
          {v.year && <span>{v.year}</span>}
          {v.mileage && <span> | {Number(v.mileage).toLocaleString("fr-FR")} km</span>}
        </div>
        {v.description && (
          <div style={styles.cardDesc}>{v.description}</div>
        )}
        <div style={styles.cardActions}>
          {isSale && (
            <button
              style={styles.btnBuy}
              onClick={() => navigate("/depot-dossier", { state: { vehicle: v } })}
            >
              Acheter
            </button>
          )}
          {isRental && (
            <button
              style={styles.btnRent}
              onClick={() => navigate("/depot-dossier", { state: { vehicle: v } })}
            >
              Louer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/vehicles/?vehicle_type=${filter}` : "/vehicles/";
    API.get(url)
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const displayed = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      String(v.price).includes(q)
    );
  });

  const featured = vehicles.slice(0, 4);

  return (
    <div style={styles.page}>
      <div style={styles.searchSection}>
        <div style={styles.searchBox}>
          <input
            style={styles.searchInput}
            placeholder="Rechercher par modèle, marque, prix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={styles.searchBtn}>RECHERCHER</button>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>NOTRE CATALOGUE COMPLET – ACHAT OU LOCATION</h2>

      <div style={styles.filterRow}>
        {[
          { label: "Tous", value: "" },
          { label: "À vendre", value: "sale" },
          { label: "En location", value: "rental" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={filter === value ? styles.filterBtnActive : styles.filterBtn}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Chargement…</p>
      ) : displayed.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>Aucun véhicule trouvé.</p>
      ) : (
        <div style={styles.grid}>
          {displayed.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}

      {featured.length > 0 && (
        <>
          <h2 style={{ ...styles.sectionTitle, marginTop: "48px" }}>
            LES VÉHICULES DU MOMENT CHEZ M-MOTORS
          </h2>
          <div style={styles.grid}>
            {featured.map((v) => <VehicleCard key={"feat-" + v.id} v={v} />)}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f0f0f0", minHeight: "100vh", padding: "24px 32px 64px", fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  searchSection: { display: "flex", justifyContent: "center", marginBottom: "32px" },
  searchBox: { display: "flex", width: "100%", maxWidth: "820px", borderRadius: "40px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", backgroundColor: "#fff" },
  searchInput: { flex: 1, border: "none", outline: "none", padding: "16px 24px", fontSize: "15px", color: "#333", backgroundColor: "transparent" },
  searchBtn: { background: "#d0d0d0", border: "none", padding: "16px 28px", fontWeight: "700", fontSize: "14px", letterSpacing: "1px", cursor: "pointer", borderRadius: "0 40px 40px 0", color: "#222" },
  sectionTitle: { textAlign: "center", fontWeight: "800", fontSize: "22px", letterSpacing: "1px", color: "#111", marginBottom: "20px", textTransform: "uppercase" },
  filterRow: { display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" },
  filterBtn: { padding: "8px 22px", border: "2px solid #bbb", borderRadius: "24px", background: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#444" },
  filterBtnActive: { padding: "8px 22px", border: "2px solid #222", borderRadius: "24px", background: "#222", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e0e0e0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" },
  imageWrapper: { width: "100%", height: "150px", overflow: "hidden", background: "#f5f5f5" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardBody: { padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" },
  cardTitle: { fontWeight: "700", fontSize: "15px", color: "#111" },
  cardPrices: { fontSize: "14px", color: "#222" },
  priceTag: { fontWeight: "700" },
  cardMeta: { fontSize: "12px", color: "#777", marginBottom: "4px" },
  cardDesc: { fontSize: "11px", color: "#999", marginBottom: "4px" },
  cardActions: { display: "flex", gap: "8px", marginTop: "4px" },
  btnBuy: { flex: 1, padding: "7px 0", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" },
  btnRent: { flex: 1, padding: "7px 0", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" },
};
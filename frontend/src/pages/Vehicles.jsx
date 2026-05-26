import { useState, useEffect } from "react";
import API from "../api/client";

const CAR_PLACEHOLDER = (brand) =>
  `https://via.placeholder.com/300x180/e8e8e8/999999?text=${encodeURIComponent(brand)}`;

function VehicleCard({ v }) {
  const isRental = v.vehicle_type === "rental";
  const isSale = v.vehicle_type === "sale";
  

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
        <div style={styles.cardTitle}>
          {v.brand} {v.model}
        </div>
        <div style={styles.cardPrices}>
            {v.vehicle_type === 'sale' ? (
                <span style={styles.priceTag}>€{Number(v.price).toLocaleString('fr-FR')}</span>
            ) : (
                <span style={styles.priceTag}>€{v.price}/jour</span>
            )}
            </div>
        <div style={styles.cardMeta}>
          {v.year && <span>{v.year}</span>}
          {v.mileage && (
            <span> | {Number(v.mileage).toLocaleString("fr-FR")} km</span>
          )}
        </div>
        <div style={styles.cardActions}>
          {(isSale || !v.vehicle_type) && (
            <button style={styles.btnBuy}>Acheter</button>
          )}
          {(isRental || !v.vehicle_type) && (
            <button style={styles.btnRent}>Louer</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- mock data so the page renders without a backend ----------
const MOCK_VEHICLES = [
  { id: 1, brand: "VW", model: "Golf", year: 2022, mileage: 18000, price: 18500, rental_price: 299, vehicle_type: "sale" },
  { id: 2, brand: "Toyota", model: "RAV4", year: 2023, mileage: 8000, price: 28500, rental_price: 399, vehicle_type: "sale" },
  { id: 3, brand: "Toyota", model: "RAV4", year: 2024, mileage: 3300, price: null, rental_price: 299, vehicle_type: "rental" },
  { id: 4, brand: "Renault", model: "Clio", year: 2025, mileage: 3000, price: null, rental_price: 199, vehicle_type: "rental" },
  { id: 5, brand: "VW", model: "Golf", year: 2021, mileage: 34000, price: 15900, rental_price: null, vehicle_type: "sale" },
  { id: 6, brand: "Peugeot", model: "308", year: 2023, mileage: 11000, price: 21500, rental_price: 349, vehicle_type: "sale" },
  { id: 7, brand: "Renault", model: "Clio", year: 2026, mileage: 3000, price: null, rental_price: 189, vehicle_type: "rental" },
  { id: 8, brand: "Toyota", model: "Yaris", year: 2024, mileage: 5000, price: null, rental_price: 229, vehicle_type: "rental" },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState(""); // "" | "sale" | "rental"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/vehicles/?vehicle_type=${filter}` : "/vehicles/";
    API.get(url)
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles(MOCK_VEHICLES))
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

  return (
    <div style={styles.page}>
      {/* ── Search bar ── */}
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

      {/* ── Catalog header ── */}
      <h2 style={styles.sectionTitle}>NOTRE CATALOGUE COMPLET – ACHAT OU LOCATION</h2>

      {/* ── Filter buttons ── */}
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

      {/* ── Grid ── */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Chargement…</p>
      ) : displayed.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>Aucun véhicule trouvé.</p>
      ) : (
        <div style={styles.grid}>
          {displayed.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      )}

      {/* ── Featured section ── */}
      <h2 style={{ ...styles.sectionTitle, marginTop: "48px" }}>
        LES VÉHICULES DU MOMENT CHEZ M-MOTORS
      </h2>
      <div style={styles.grid}>
        {MOCK_VEHICLES.slice(0, 4).map((v) => (
          <VehicleCard key={"feat-" + v.id} v={v} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = {
  page: {
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    padding: "24px 32px 64px",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
  },

  /* Search */
  searchSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "32px",
  },
  searchBox: {
    display: "flex",
    width: "100%",
    maxWidth: "820px",
    borderRadius: "40px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "16px 24px",
    fontSize: "15px",
    color: "#333",
    backgroundColor: "transparent",
  },
  searchBtn: {
    background: "#d0d0d0",
    border: "none",
    padding: "16px 28px",
    fontWeight: "700",
    fontSize: "14px",
    letterSpacing: "1px",
    cursor: "pointer",
    borderRadius: "0 40px 40px 0",
    color: "#222",
    transition: "background 0.2s",
  },

  /* Section title */
  sectionTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "22px",
    letterSpacing: "1px",
    color: "#111",
    marginBottom: "20px",
    textTransform: "uppercase",
  },

  /* Filter buttons */
  filterRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  filterBtn: {
    padding: "8px 22px",
    border: "2px solid #bbb",
    borderRadius: "24px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    color: "#444",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    padding: "8px 22px",
    border: "2px solid #222",
    borderRadius: "24px",
    background: "#222",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    color: "#fff",
    transition: "all 0.2s",
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  /* Card */
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  imageWrapper: {
    width: "100%",
    height: "150px",
    overflow: "hidden",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBody: {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#111",
  },
  cardPrices: {
    fontSize: "14px",
    color: "#222",
  },
  priceTag: {
    fontWeight: "700",
  },
  priceTagSecondary: {
    fontWeight: "500",
    color: "#555",
  },
  cardMeta: {
    fontSize: "12px",
    color: "#777",
    marginBottom: "6px",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  btnBuy: {
    flex: 1,
    padding: "7px 0",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnRent: {
    flex: 1,
    padding: "7px 0",
    background: "#fff",
    color: "#111",
    border: "2px solid #111",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

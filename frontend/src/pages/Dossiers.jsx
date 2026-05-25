import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/client";

const CAR_PLACEHOLDER = (label) =>
  `https://via.placeholder.com/80x55/ddd/888?text=${encodeURIComponent(label)}`;

const MOCK_VEHICLES = [
  { id: 1, brand: "VW",      model: "Golf",  price: 150, vehicle_type: "sale",   rental_price: 20,  mileage: 18000 },
  { id: 2, brand: "Toyota",  model: "RAV4",  price: 200, vehicle_type: "sale",   rental_price: 370, mileage: 8000  },
  { id: 3, brand: "Renault", model: "Clio",  price: 280, vehicle_type: "rental", rental_price: 870, mileage: 3000  },
  { id: 4, brand: "Renault", model: "Clio",  price: 500, vehicle_type: "rental", rental_price: 170, mileage: 5000  },
];

/* ─── Sidebar ─── */
function Sidebar({ active }) {
  const items = [
    { label: "Tableau de Bord", icon: "🎨", href: "/admin" },
    { label: "Dossiers",        icon: "📁", href: "/dossiers" },
    { label: "Configuration",   icon: "⚙️",  href: "/config" },
  ];
  return (
    <aside style={styles.sidebar}>
      {items.map(({ label, icon, href }) => (
        <Link
          key={label}
          to={href}
          style={{
            ...styles.sidebarItem,
            background: active === label ? "#e8f5e9" : "transparent",
            fontWeight: active === label ? "700" : "500",
          }}
        >
          <span style={{ marginRight: "10px" }}>{icon}</span>
          {label}
        </Link>
      ))}
    </aside>
  );
}

/* ─── Main component ─── */
export default function Dossiers() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/vehicles/")
      .then((res) => setVehicles(res.data))
      .catch(() => setVehicles(MOCK_VEHICLES));
  }, []);

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q)
    );
  });

  const totalSale   = vehicles.filter((v) => v.vehicle_type === "sale").length;
  const totalRental = vehicles.filter((v) => v.vehicle_type === "rental").length;

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    API.delete(`/vehicles/${id}/`)
      .catch(() => {})
      .finally(() => setVehicles((prev) => prev.filter((v) => v.id !== id)));
  };

  const startEdit = (v) => {
    setEditingId(v.id);
    setEditForm({ ...v });
  };

  const saveEdit = () => {
    API.put(`/vehicles/${editingId}/`, editForm)
      .catch(() => {})
      .finally(() => {
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingId ? { ...editForm } : v))
        );
        setEditingId(null);
      });
  };

  return (
    <div style={styles.layout}>
      <Sidebar active="Tableau de Bord" />

      <main style={styles.main}>
        {/* Title + decor */}
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Gestion de la Flotte Véhicules</h1>
          <div style={styles.decorCircle} />
        </div>

        {/* Info panel */}
        <div style={styles.infoPanel}>
          <p style={styles.infoPanelTitle}>Attentes de l'exercice :</p>
          <ul style={styles.infoPanelList}>
            {[
              "Achat/Location",
              "Inscription dématérialisée",
              "Suivi de dossier",
              "Gestion Back-office",
              "Cloud",
              "Logs/Alerte",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <button
            style={styles.addBtn}
            onClick={() => navigate("/vehicles/new")}
          >
            + &nbsp;Ajouter un Véhicule
          </button>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              placeholder="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Image","ID","Marque","Modèle","Prix/Mois (Achat)","Type Offre","Action","Statut Offre"].map(
                  (h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} style={styles.tr}>
                  {/* Image */}
                  <td style={styles.td}>
                    <img
                      src={v.image || CAR_PLACEHOLDER(`${v.brand}`)}
                      alt={v.model}
                      style={styles.carImg}
                      onError={(e) => {
                        e.target.src = CAR_PLACEHOLDER(v.brand);
                      }}
                    />
                  </td>

                  {/* ID */}
                  <td style={styles.td}>{v.id}</td>

                  {/* Marque */}
                  <td style={styles.td}>
                    {editingId === v.id ? (
                      <input
                        value={editForm.brand}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, brand: e.target.value }))
                        }
                        style={styles.editInput}
                      />
                    ) : (
                      v.brand
                    )}
                  </td>

                  {/* Modèle */}
                  <td style={styles.td}>
                    {editingId === v.id ? (
                      <input
                        value={editForm.model}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, model: e.target.value }))
                        }
                        style={styles.editInput}
                      />
                    ) : (
                      v.model
                    )}
                  </td>

                  {/* Prix */}
                  <td style={styles.td}>
                    {editingId === v.id ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, price: e.target.value }))
                        }
                        style={{ ...styles.editInput, width: "80px" }}
                      />
                    ) : (
                      `€ ${v.price}€`
                    )}
                  </td>

                  {/* Type offre */}
                  <td style={styles.td}>
                    {v.vehicle_type === "sale" ? "Achat" : "Location"}
                  </td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {editingId === v.id ? (
                        <>
                          <button style={styles.saveBtn} onClick={saveEdit}>
                            ✓
                          </button>
                          <button
                            style={styles.cancelBtn}
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={styles.iconBtn}
                            onClick={() => startEdit(v)}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            style={styles.iconBtnDanger}
                            onClick={() => handleDelete(v.id)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Statut offre */}
                  <td style={styles.td}>
                    <div style={styles.statutCell}>
                      <span style={styles.statutText}>
                        {v.vehicle_type === "sale" ? "Achat" : "Location"}
                        <br />
                        <span style={styles.statutSub}>
                          {v.rental_price
                            ? `$${v.rental_price} Mois`
                            : "—"}
                        </span>
                      </span>
                      <button style={styles.statutEdit}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <p style={styles.footerCount}>
          Total Véhicules : {vehicles.length} | {totalSale} Achat |{" "}
          {totalRental} Location
        </p>

        {/* Featured section */}
        <h2 style={styles.featuredTitle}>
          LES VÉHICULES DU MOMENT CHEZ M-MOTORS
        </h2>
      </main>
    </div>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
  },

  /* Sidebar */
  sidebar: {
    width: "200px",
    flexShrink: 0,
    backgroundColor: "#f8f8f8",
    borderRight: "1px solid #ddd",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    color: "#222",
    textDecoration: "none",
    fontSize: "14px",
    borderRadius: "0 24px 24px 0",
    marginRight: "12px",
    transition: "background 0.15s",
  },

  /* Main */
  main: {
    flex: 1,
    padding: "32px 40px",
    position: "relative",
  },

  titleRow: {
    position: "relative",
    marginBottom: "16px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  decorCircle: {
    position: "absolute",
    top: "-20px",
    right: "80px",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    border: "22px solid rgba(0,0,0,0.06)",
    pointerEvents: "none",
  },

  /* Info panel */
  infoPanel: {
    position: "absolute",
    top: "32px",
    right: "40px",
    border: "2px solid #2ecc71",
    borderRadius: "8px",
    padding: "14px 18px",
    backgroundColor: "#fff",
    maxWidth: "240px",
    zIndex: 10,
  },
  infoPanelTitle: {
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "6px",
    color: "#111",
  },
  infoPanelList: {
    margin: 0,
    paddingLeft: "16px",
    fontSize: "13px",
    color: "#222",
    lineHeight: "1.8",
  },

  /* Toolbar */
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    marginTop: "8px",
  },
  addBtn: {
    padding: "12px 22px",
    background: "#2563EB",
    color: "#fff",
    border: "2px solid #1d4ed8",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    padding: "10px 14px",
    gap: "8px",
    flex: 1,
    maxWidth: "340px",
  },
  searchIcon: { fontSize: "14px", color: "#888" },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#333",
    width: "100%",
    fontFamily: "inherit",
  },

  /* Table */
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #ddd",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "14px 12px",
    textAlign: "left",
    fontWeight: "700",
    color: "#111",
    borderBottom: "2px solid #eee",
    backgroundColor: "#fafafa",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background 0.15s",
  },
  td: {
    padding: "10px 12px",
    color: "#333",
    verticalAlign: "middle",
  },
  carImg: {
    width: "80px",
    height: "55px",
    objectFit: "cover",
    borderRadius: "6px",
    backgroundColor: "#eee",
  },

  /* Edit inline */
  editInput: {
    border: "1.5px solid #2563EB",
    borderRadius: "6px",
    padding: "6px 8px",
    fontSize: "13px",
    outline: "none",
    width: "100px",
    fontFamily: "inherit",
  },

  /* Action buttons */
  iconBtn: {
    background: "#f0f0f0",
    border: "none",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  iconBtnDanger: {
    background: "#f0f0f0",
    border: "none",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  saveBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  cancelBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },

  /* Statut offre */
  statutCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statutText: {
    fontSize: "13px",
    color: "#222",
    lineHeight: "1.4",
  },
  statutSub: {
    fontSize: "12px",
    color: "#666",
  },
  statutEdit: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    color: "#888",
  },

  /* Footer */
  footerCount: {
    textAlign: "center",
    fontSize: "13px",
    color: "#555",
    margin: "16px 0 32px",
  },

  featuredTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "20px",
    letterSpacing: "1px",
    color: "#111",
    textTransform: "uppercase",
  },
};

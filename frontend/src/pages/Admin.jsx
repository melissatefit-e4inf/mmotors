import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/client";

const statusConfig = {
  pending:   { label: "En attente", color: "#D97706", bg: "#FFF7ED" },
  validated: { label: "Validé",     color: "#16A34A", bg: "#F0FDF4" },
  refused:   { label: "Refusé",     color: "#DC2626", bg: "#FEF2F2" },
};

const CAR_PLACEHOLDER = (label) =>
  `https://via.placeholder.com/80x55/ddd/888?text=${encodeURIComponent(label)}`;

function Sidebar({ active }) {
  const items = [
    { label: "Tableau de bord", icon: "", href: "/admin" },
    { label: "Dossiers",        icon: "📁", href: "/admin/dossiers" },
    { label: "Dossiers", icon: "📁", href: "/admin" },
  ];
  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarLogo}>M-Motors</div>
      {items.map(({ label, icon, href }) => (
        <Link
          key={label}
          to={href}
          style={{
            ...styles.sidebarItem,
            background: active === label ? "#EFF6FF" : "transparent",
            color: active === label ? "#1D4ED8" : "#374151",
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

export default function Admin() {
  const [tab, setTab]           = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [search, setSearch]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get("/vehicles/").then((r) => setVehicles(r.data)).catch(() => {}),
      API.get("/dossiers/").then((r) => setDossiers(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const refetchDossiers = () =>
    API.get("/dossiers/").then((r) => setDossiers(r.data)).catch(() => {});

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/dossiers/${id}/status`, { status });
      refetchDossiers();
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    API.delete(`/vehicles/${id}`)
      .catch(() => {})
      .finally(() => setVehicles((prev) => prev.filter((v) => v.id !== id)));
  };

  const startEdit = (v) => { setEditingId(v.id); setEditForm({ ...v }); };
  const saveEdit  = () => {
    API.patch(`/vehicles/${editingId}/type`, { vehicle_type: editForm.vehicle_type })
      .catch(() => {})
      .finally(() => {
        setVehicles((prev) => prev.map((v) => v.id === editingId ? { ...editForm } : v));
        setEditingId(null);
      });
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.brand?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q);
  });

  const totalSale   = vehicles.filter((v) => v.vehicle_type === "sale").length;
  const totalRental = vehicles.filter((v) => v.vehicle_type === "rental").length;
  const pending     = dossiers.filter((d) => d.status === "pending").length;

  return (
    <div style={styles.layout}>
      <Sidebar active="Tableau de bord" />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Back-office M-Motors</h1>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{vehicles.length}</div>
              <div style={styles.statLabel}>Véhicules</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{dossiers.length}</div>
              <div style={styles.statLabel}>Dossiers</div>
            </div>
            <div style={{ ...styles.statCard, borderColor: "#FCD34D" }}>
              <div style={{ ...styles.statNum, color: "#D97706" }}>{pending}</div>
              <div style={styles.statLabel}>En attente</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={tab === "vehicles" ? styles.tabActive : styles.tab}
            onClick={() => setTab("vehicles")}
          >
             Véhicules ({vehicles.length})
          </button>
          <button
            style={tab === "dossiers" ? styles.tabActive : styles.tab}
            onClick={() => setTab("dossiers")}
          >
             Dossiers ({dossiers.length})
          </button>
        </div>

        {/* ── TAB VEHICULES ── */}
        {tab === "vehicles" && (
          <>
            <div style={styles.toolbar}>
              <div style={styles.searchBox}>
                <span>🔍</span>
                <input
                  placeholder="Rechercher un véhicule..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <span style={styles.footerCount}>
                {totalSale} vente · {totalRental} location
              </span>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Image","ID","Marque","Modèle","Prix","Type","Actions"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img
                          src={v.image_url || CAR_PLACEHOLDER(v.brand)}
                          alt={v.model}
                          style={styles.carImg}
                          onError={(e) => { e.target.src = CAR_PLACEHOLDER(v.brand); }}
                        />
                      </td>
                      <td style={styles.td}>#{v.id}</td>
                      <td style={styles.td}>
                        {editingId === v.id ? (
                          <input value={editForm.brand}
                            onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))}
                            style={styles.editInput} />
                        ) : v.brand}
                      </td>
                      <td style={styles.td}>
                        {editingId === v.id ? (
                          <input value={editForm.model}
                            onChange={(e) => setEditForm((p) => ({ ...p, model: e.target.value }))}
                            style={styles.editInput} />
                        ) : v.model}
                      </td>
                      <td style={styles.td}>
                        {v.vehicle_type === "sale"
                          ? `€${Number(v.price).toLocaleString("fr-FR")}`
                          : `€${v.price}/jour`}
                      </td>
                      <td style={styles.td}>
                        {editingId === v.id ? (
                          <select value={editForm.vehicle_type}
                            onChange={(e) => setEditForm((p) => ({ ...p, vehicle_type: e.target.value }))}
                            style={styles.editInput}>
                            <option value="sale">Vente</option>
                            <option value="rental">Location</option>
                          </select>
                        ) : (
                          <span style={{
                            ...styles.typeBadge,
                            background: v.vehicle_type === "sale" ? "#EFF6FF" : "#F0FDF4",
                            color: v.vehicle_type === "sale" ? "#1D4ED8" : "#16A34A",
                          }}>
                            {v.vehicle_type === "sale" ? "Vente" : "Location"}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {editingId === v.id ? (
                            <>
                              <button style={styles.btnGreen} onClick={saveEdit}>✓ Sauver</button>
                              <button style={styles.btnGray} onClick={() => setEditingId(null)}>✕</button>
                            </>
                          ) : (
                            <>
                              <button style={styles.btnIcon} onClick={() => startEdit(v)}>✏️</button>
                              <button style={styles.btnIcon} onClick={() => handleDelete(v.id)}>🗑️</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── TAB DOSSIERS ── */}
        {tab === "dossiers" && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["ID","Type","Véhicule","Notes","Statut","Actions"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dossiers.map((d) => {
                  const st = statusConfig[d.status] || statusConfig.pending;
                  return (
                    <tr key={d.id} style={styles.tr}>
                      <td style={styles.td}>#{d.id}</td>
                      <td style={styles.td}>
                        {d.dossier_type === "purchase" ? "Achat" : "Location"}
                      </td>
                      <td style={styles.td}>#{d.vehicle_id}</td>
                      <td style={{ ...styles.td, maxWidth: "180px", fontSize: "12px", color: "#64748B" }}>
                        {d.notes || "—"}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.typeBadge, color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {d.status !== "validated" && (
                            <button style={styles.btnGreen} onClick={() => updateStatus(d.id, "validated")}>
                              Valider
                            </button>
                          )}
                          {d.status !== "refused" && (
                            <button style={styles.btnRed} onClick={() => updateStatus(d.id, "refused")}>
                              Refuser
                            </button>
                          )}
                          {d.status !== "pending" && (
                            <button style={styles.btnGray} onClick={() => updateStatus(d.id, "pending")}>
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {dossiers.length === 0 && (
              <p style={{ textAlign: "center", padding: "32px", color: "#64748B" }}>
                Aucun dossier.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout:      { display: "flex", minHeight: "100vh", backgroundColor: "#f0f0f0", fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  sidebar:     { width: "200px", flexShrink: 0, backgroundColor: "#fff", borderRight: "1px solid #E2E8F0", padding: "24px 0", display: "flex", flexDirection: "column", gap: "4px" },
  sidebarLogo: { padding: "0 20px 20px", fontWeight: "800", fontSize: "18px", color: "#1D4ED8", borderBottom: "1px solid #E2E8F0", marginBottom: "8px" },
  sidebarItem: { display: "flex", alignItems: "center", padding: "10px 20px", textDecoration: "none", fontSize: "14px", borderRadius: "0 24px 24px 0", marginRight: "12px", transition: "background 0.15s" },
  main:        { flex: 1, padding: "32px 40px" },
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  pageTitle:   { fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 },
  stats:       { display: "flex", gap: "12px" },
  statCard:    { background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px 20px", textAlign: "center", minWidth: "80px" },
  statNum:     { fontSize: "22px", fontWeight: "800", color: "#111" },
  statLabel:   { fontSize: "11px", color: "#94A3B8", marginTop: "2px" },
  tabs:        { display: "flex", gap: "8px", marginBottom: "20px" },
  tab:         { padding: "8px 20px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#64748B" },
  tabActive:   { padding: "8px 20px", background: "#1D4ED8", border: "1px solid #1D4ED8", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#fff" },
  toolbar:     { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" },
  searchBox:   { display: "flex", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", padding: "8px 14px", gap: "8px", flex: 1, maxWidth: "340px" },
  searchInput: { border: "none", outline: "none", fontSize: "14px", color: "#333", width: "100%", fontFamily: "inherit" },
  footerCount: { fontSize: "13px", color: "#64748B" },
  tableWrapper:{ background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th:          { padding: "12px 14px", textAlign: "left", fontWeight: "700", color: "#374151", borderBottom: "2px solid #F1F5F9", backgroundColor: "#F8FAFC", whiteSpace: "nowrap" },
  tr:          { borderBottom: "1px solid #F1F5F9" },
  td:          { padding: "10px 14px", color: "#374151", verticalAlign: "middle" },
  carImg:      { width: "80px", height: "52px", objectFit: "cover", borderRadius: "6px", backgroundColor: "#eee" },
  editInput:   { border: "1.5px solid #1D4ED8", borderRadius: "6px", padding: "5px 8px", fontSize: "13px", outline: "none", fontFamily: "inherit" },
  typeBadge:   { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  btnIcon:     { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "14px" },
  btnGreen:    { padding: "5px 12px", background: "#16A34A", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  btnRed:      { padding: "5px 12px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  btnGray:     { padding: "5px 12px", background: "#64748B", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};
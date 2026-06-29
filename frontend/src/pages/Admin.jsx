import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://mmotorsmmotors-backend.onrender.com";

const statusConfig = {
  pending: { label: "En attente", color: "#D97706", bg: "#FFF7ED" },
  validated: { label: "Validé", color: "#16A34A", bg: "#F0FDF4" },
  refused: { label: "Refusé", color: "#DC2626", bg: "#FEF2F2" },
};

const CAR_PLACEHOLDER = (label) =>
  `https://via.placeholder.com/80x55/ddd/888?text=${encodeURIComponent(label)}`;

function Sidebar({ active }) {
  const items = [
    { label: "Tableau de bord", href: "/admin" },
    { label: "Dossiers", href: "/admin/dossiers" },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarLogo}>M-Motors</div>

      {items.map(({ label, href }) => (
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
          {label}
        </Link>
      ))}
    </aside>
  );
}

function documentUrl(path) {
  if (!path) return null;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

function DocumentLinks({ dossier }) {
  const documents = [
    { label: "Pièce identité", path: dossier.id_card_path },
    { label: "Domicile", path: dossier.proof_of_address_path },
    { label: "Revenus", path: dossier.income_proof_path },
  ];

  const availableDocs = documents.filter((doc) => doc.path);

  if (availableDocs.length === 0) {
    return <span style={styles.emptyText}>Aucun</span>;
  }

  return (
    <div style={styles.documentLinks}>
      {availableDocs.map((doc) => (
        <a
          key={doc.label}
          href={documentUrl(doc.path)}
          target="_blank"
          rel="noreferrer"
          style={styles.documentLink}
        >
          {doc.label}
        </a>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/vehicles/").then((res) => setVehicles(res.data)),
      API.get("/dossiers/").then((res) => setDossiers(res.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refetchDossiers = () => {
    API.get("/dossiers/")
      .then((res) => setDossiers(res.data))
      .catch(() => {});
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/dossiers/${id}/status`, { status });
      refetchDossiers();
    } catch {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;

    API.delete(`/vehicles/${id}`)
      .then(() => {
        setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      })
      .catch(() => {
        alert("Erreur lors de la suppression.");
      });
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setEditForm({ ...vehicle });
  };

  const saveEdit = async () => {
    try {
      await API.patch(`/vehicles/${editingId}/type`, {
        vehicle_type: editForm.vehicle_type,
      });

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === editingId ? { ...vehicle, ...editForm } : vehicle
        )
      );

      setEditingId(null);
    } catch {
      alert("Erreur lors de la modification.");
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = search.toLowerCase().trim();

    return (
      !query ||
      vehicle.brand?.toLowerCase().includes(query) ||
      vehicle.model?.toLowerCase().includes(query)
    );
  });

  const totalSale = vehicles.filter(
    (vehicle) => vehicle.vehicle_type === "sale"
  ).length;

  const totalRental = vehicles.filter(
    (vehicle) => vehicle.vehicle_type === "rental"
  ).length;

  const totalBoth = vehicles.filter(
    (vehicle) => vehicle.vehicle_type === "both"
  ).length;

  const pending = dossiers.filter((dossier) => dossier.status === "pending").length;

  if (loading) {
    return (
      <div style={styles.layout}>
        <Sidebar active="Tableau de bord" />
        <main style={styles.main}>
          <p style={styles.emptyText}>Chargement du back-office...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <Sidebar active={tab === "dossiers" ? "Dossiers" : "Tableau de bord"} />

      <main style={styles.main}>
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
              <div style={{ ...styles.statNum, color: "#D97706" }}>
                {pending}
              </div>
              <div style={styles.statLabel}>En attente</div>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            type="button"
            style={tab === "vehicles" ? styles.tabActive : styles.tab}
            onClick={() => setTab("vehicles")}
          >
            Véhicules ({vehicles.length})
          </button>

          <button
            type="button"
            style={tab === "dossiers" ? styles.tabActive : styles.tab}
            onClick={() => setTab("dossiers")}
          >
            Dossiers ({dossiers.length})
          </button>
        </div>

        {tab === "vehicles" && (
          <>
            <div style={styles.toolbar}>
              <div style={styles.searchBox}>
                <span>🔍</span>
                <input
                  placeholder="Rechercher un véhicule..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <span style={styles.footerCount}>
                {totalSale} vente · {totalRental} location · {totalBoth} mixte
              </span>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Image", "ID", "Marque", "Modèle", "Prix", "Type", "Actions"].map(
                      (header) => (
                        <th key={header} style={styles.th}>
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img
                          src={vehicle.image_url || CAR_PLACEHOLDER(vehicle.brand)}
                          alt={vehicle.model}
                          style={styles.carImg}
                          onError={(event) => {
                            event.currentTarget.src = CAR_PLACEHOLDER(vehicle.brand);
                          }}
                        />
                      </td>

                      <td style={styles.td}>#{vehicle.id}</td>

                      <td style={styles.td}>{vehicle.brand}</td>

                      <td style={styles.td}>{vehicle.model}</td>

                      <td style={styles.td}>
                        {vehicle.vehicle_type === "sale"
                          ? `€${Number(vehicle.price).toLocaleString("fr-FR")}`
                          : `€${vehicle.price}/jour`}
                      </td>

                      <td style={styles.td}>
                        {editingId === vehicle.id ? (
                          <select
                            value={editForm.vehicle_type}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                vehicle_type: event.target.value,
                              }))
                            }
                            style={styles.editInput}
                          >
                            <option value="sale">Vente</option>
                            <option value="rental">Location</option>
                            <option value="both">Vente et location</option>
                          </select>
                        ) : (
                          <span style={styles.typeBadge}>
                            {vehicle.vehicle_type === "sale"
                              ? "Vente"
                              : vehicle.vehicle_type === "rental"
                              ? "Location"
                              : "Vente et location"}
                          </span>
                        )}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          {editingId === vehicle.id ? (
                            <>
                              <button
                                type="button"
                                style={styles.btnGreen}
                                onClick={saveEdit}
                              >
                                Sauver
                              </button>

                              <button
                                type="button"
                                style={styles.btnGray}
                                onClick={() => setEditingId(null)}
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                style={styles.btnIcon}
                                onClick={() => startEdit(vehicle)}
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                style={styles.btnIcon}
                                onClick={() => handleDelete(vehicle.id)}
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredVehicles.length === 0 && (
                <p style={styles.emptyText}>Aucun véhicule trouvé.</p>
              )}
            </div>
          </>
        )}

        {tab === "dossiers" && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "ID",
                    "Type",
                    "Véhicule",
                    "Notes",
                    "Justificatifs",
                    "Statut",
                    "Actions",
                  ].map((header) => (
                    <th key={header} style={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {dossiers.map((dossier) => {
                  const status =
                    statusConfig[dossier.status] || statusConfig.pending;

                  return (
                    <tr key={dossier.id} style={styles.tr}>
                      <td style={styles.td}>#{dossier.id}</td>

                      <td style={styles.td}>
                        {dossier.dossier_type === "purchase"
                          ? "Achat"
                          : "Location"}
                      </td>

                      <td style={styles.td}>#{dossier.vehicle_id}</td>

                      <td style={{ ...styles.td, maxWidth: "180px" }}>
                        {dossier.notes || "—"}
                      </td>

                      <td style={styles.td}>
                        <DocumentLinks dossier={dossier} />
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            color: status.color,
                            background: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          {dossier.status !== "validated" && (
                            <button
                              type="button"
                              style={styles.btnGreen}
                              onClick={() =>
                                updateStatus(dossier.id, "validated")
                              }
                            >
                              Valider
                            </button>
                          )}

                          {dossier.status !== "refused" && (
                            <button
                              type="button"
                              style={styles.btnRed}
                              onClick={() => updateStatus(dossier.id, "refused")}
                            >
                              Refuser
                            </button>
                          )}

                          {dossier.status !== "pending" && (
                            <button
                              type="button"
                              style={styles.btnGray}
                              onClick={() => updateStatus(dossier.id, "pending")}
                            >
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
              <p style={styles.emptyText}>Aucun dossier.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
  },
  sidebar: {
    width: "200px",
    flexShrink: 0,
    backgroundColor: "#fff",
    borderRight: "1px solid #E2E8F0",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sidebarLogo: {
    padding: "0 20px 20px",
    fontWeight: "800",
    fontSize: "18px",
    color: "#1D4ED8",
    borderBottom: "1px solid #E2E8F0",
    marginBottom: "8px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    textDecoration: "none",
    fontSize: "14px",
    borderRadius: "0 24px 24px 0",
    marginRight: "12px",
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    overflowX: "auto",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "24px",
    flexWrap: "wrap",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#111",
    margin: 0,
  },
  stats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "12px 20px",
    textAlign: "center",
    minWidth: "80px",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111",
  },
  statLabel: {
    fontSize: "11px",
    color: "#94A3B8",
    marginTop: "2px",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  tab: {
    padding: "8px 20px",
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    color: "#64748B",
  },
  tabActive: {
    padding: "8px 20px",
    background: "#1D4ED8",
    border: "1px solid #1D4ED8",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    color: "#fff",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    background: "#fff",
    padding: "8px 14px",
    gap: "8px",
    flex: 1,
    maxWidth: "340px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#333",
    width: "100%",
    fontFamily: "inherit",
  },
  footerCount: {
    fontSize: "13px",
    color: "#64748B",
  },
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    overflowX: "auto",
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    minWidth: "900px",
  },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: "700",
    color: "#374151",
    borderBottom: "2px solid #F1F5F9",
    backgroundColor: "#F8FAFC",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #F1F5F9",
  },
  td: {
    padding: "10px 14px",
    color: "#374151",
    verticalAlign: "middle",
  },
  carImg: {
    width: "80px",
    height: "52px",
    objectFit: "cover",
    borderRadius: "6px",
    backgroundColor: "#eee",
  },
  editInput: {
    border: "1.5px solid #1D4ED8",
    borderRadius: "6px",
    padding: "5px 8px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  typeBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#EFF6FF",
    color: "#1D4ED8",
    whiteSpace: "nowrap",
  },
  actionButtons: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  btnIcon: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  btnGreen: {
    padding: "5px 12px",
    background: "#16A34A",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnRed: {
    padding: "5px 12px",
    background: "#DC2626",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnGray: {
    padding: "5px 12px",
    background: "#64748B",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  documentLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  documentLink: {
    color: "#1D4ED8",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "underline",
  },
  emptyText: {
    color: "#64748B",
    fontSize: "13px",
    padding: "16px",
  },
};
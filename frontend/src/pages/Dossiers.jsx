import { useState, useEffect } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  pending:   { label: "En attente",  color: "#D97706", bg: "#FFF7ED" },
  validated: { label: "Validé",      color: "#16A34A", bg: "#F0FDF4" },
  refused:   { label: "Refusé",      color: "#DC2626", bg: "#FEF2F2" },
};

const typeLabel = {
  purchase: "Achat",
  rental:   "Location longue durée",
};

export default function Dossiers() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    API.get("/dossiers/")
      .then((res) => setDossiers(res.data))
      .catch(() => setError("Impossible de charger vos dossiers."))
      .finally(() => setLoading(false));
  }, []);

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Connexion requise</h2>
          <p>Vous devez être connecté pour accéder à vos dossiers.</p>
          <button style={styles.btnPrimary} onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Mes dossiers</h2>
        <button style={styles.btnSecondary} onClick={() => navigate("/vehicles")}>
          Nouveau dossier
        </button>
      </div>

      {loading && <p style={styles.info}>Chargement…</p>}
      {error   && <p style={styles.error}>{error}</p>}

      {!loading && dossiers.length === 0 && (
        <div style={styles.empty}>
          <p style={{ color: "#64748B", marginBottom: "16px" }}>
            Vous n'avez pas encore de dossier.
          </p>
          <button style={styles.btnPrimary} onClick={() => navigate("/vehicles")}>
            Parcourir le catalogue
          </button>
        </div>
      )}

      <div style={styles.list}>
        {dossiers.map((d) => {
          const status = statusConfig[d.status] || statusConfig.pending;
          return (
            <div key={d.id} style={styles.dossierCard}>
              <div style={styles.dossierTop}>
                <div>
                  <div style={styles.dossierTitle}>
                    Dossier #{d.id} - {typeLabel[d.dossier_type] || d.dossier_type}
                  </div>
                  <div style={styles.dossierMeta}>
                    Véhicule #{d.vehicle_id}
                  </div>
                  {d.notes && (
                    <div style={styles.dossierNotes}>"{d.notes}"</div>
                  )}
                </div>
                <div style={{
                  ...styles.statusBadge,
                  color: status.color,
                  background: status.bg,
                }}>
                  {status.label}
                </div>
              </div>

              <div style={styles.timeline}>
                {["pending", "validated"].map((step, i) => {
                  const steps = ["pending", "validated", "refused"];
                  const currentIdx = steps.indexOf(d.status);
                  const active = i <= (d.status === "refused" ? 0 : currentIdx);
                  return (
                    <div key={step} style={styles.timelineStep}>
                      <div style={{
                        ...styles.timelineDot,
                        background: active ? "#1D4ED8" : "#E2E8F0",
                      }} />
                      <div style={{
                        ...styles.timelineLabel,
                        color: active ? "#1D4ED8" : "#94A3B8",
                        fontWeight: active ? "600" : "400",
                      }}>
                        {step === "pending" ? "Déposé" : "Traité"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f0f0f0", minHeight: "100vh", padding: "32px 24px", fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "720px", margin: "0 auto 24px" },
  title: { fontSize: "22px", fontWeight: "800", color: "#111", margin: 0 },
  list: { maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  dossierCard: { background: "#fff", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0" },
  dossierTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  dossierTitle: { fontWeight: "700", fontSize: "16px", color: "#111" },
  dossierMeta: { fontSize: "13px", color: "#64748B", marginTop: "4px" },
  dossierNotes: { fontSize: "12px", color: "#94A3B8", marginTop: "6px", fontStyle: "italic" },
  statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" },
  timeline: { display: "flex", gap: "32px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" },
  timelineStep: { display: "flex", alignItems: "center", gap: "8px" },
  timelineDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  timelineLabel: { fontSize: "12px" },
  card: { background: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "480px", margin: "80px auto", textAlign: "center" },
  empty: { background: "#fff", borderRadius: "12px", padding: "40px", maxWidth: "720px", margin: "0 auto", textAlign: "center" },
  info: { textAlign: "center", color: "#888" },
  error: { textAlign: "center", color: "#DC2626" },
  btnPrimary: { padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
  btnSecondary: { padding: "8px 20px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
};
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/client";

export default function DepotDossier() {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicle = location.state?.vehicle;

  const [form, setForm] = useState({
    notes: "",
    dossier_type: vehicle?.vehicle_type === "rental" ? "rental" : "purchase",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Connexion requise</h2>
          <p>Vous devez être connecté pour déposer un dossier.</p>
          <button style={styles.btnPrimary} onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Aucun véhicule sélectionné</h2>
          <button style={styles.btnPrimary} onClick={() => navigate("/vehicles")}>
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/dossiers/", {
        vehicle_id: vehicle.id,
        dossier_type: form.dossier_type,
        notes: form.notes,
      });
      setSuccess(true);
    } catch {
      setError("Erreur lors du dépôt du dossier. Veuillez réessayer.");
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ color: "#16A34A" }}>Dossier déposé avec succès !</h2>
          <p style={{ color: "#64748B" }}>
            Votre dossier pour le <strong>{vehicle.brand} {vehicle.model}</strong> a été
            transmis à notre équipe. Vous pouvez suivre son avancement depuis votre espace client.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button style={styles.btnPrimary} onClick={() => navigate("/dossiers")}>
              Suivre mon dossier
            </button>
            <button style={styles.btnSecondary} onClick={() => navigate("/vehicles")}>
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Déposer un dossier</h2>

        {/* Résumé véhicule */}
        <div style={styles.vehicleSummary}>
          {vehicle.image_url && (
            <img src={vehicle.image_url} alt={vehicle.brand} style={styles.vehicleImg} />
          )}
          <div>
            <div style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</div>
            <div style={styles.vehicleInfo}>{vehicle.year} · {Number(vehicle.mileage).toLocaleString("fr-FR")} km</div>
            <div style={styles.vehiclePrice}>
              {vehicle.vehicle_type === "sale"
                ? `€${Number(vehicle.price).toLocaleString("fr-FR")}`
                : `€${vehicle.price}/jour`}
            </div>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Type de dossier</label>
            <select
              style={styles.input}
              value={form.dossier_type}
              onChange={(e) => setForm({ ...form, dossier_type: e.target.value })}
            >
              <option value="purchase">Achat</option>
              <option value="rental">Location longue durée</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Message / informations complémentaires</label>
            <textarea
              style={{ ...styles.input, height: "100px", resize: "vertical" }}
              placeholder="Précisez vos besoins, disponibilités, questions..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Documents justificatifs</label>
            <div style={styles.uploadZone}>
              <p style={{ color: "#64748B", margin: 0 }}>
                📎 Upload de documents - disponible prochainement
              </p>
              <p style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0" }}>
                Permis de conduire, justificatif de revenus, pièce d'identité
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" style={styles.btnPrimary}>
              Déposer mon dossier
            </button>
            <button type="button" style={styles.btnSecondary} onClick={() => navigate("/vehicles")}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f0f0f0", minHeight: "100vh", padding: "40px 24px", fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif" },
  card: { background: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "600px", margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  title: { fontSize: "22px", fontWeight: "800", marginBottom: "24px", color: "#111" },
  vehicleSummary: { display: "flex", gap: "16px", alignItems: "center", background: "#F8FAFC", borderRadius: "8px", padding: "16px", marginBottom: "24px" },
  vehicleImg: { width: "100px", height: "65px", objectFit: "cover", borderRadius: "6px" },
  vehicleName: { fontWeight: "700", fontSize: "16px", color: "#111" },
  vehicleInfo: { fontSize: "13px", color: "#64748B", marginTop: "2px" },
  vehiclePrice: { fontWeight: "700", fontSize: "15px", color: "#1D4ED8", marginTop: "4px" },
  field: { marginBottom: "18px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  uploadZone: { border: "2px dashed #CBD5E1", borderRadius: "8px", padding: "24px", textAlign: "center" },
  error: { color: "#DC2626", fontSize: "14px", marginBottom: "16px" },
  successIcon: { width: "56px", height: "56px", background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#16A34A", margin: "0 auto 16px" },
  btnPrimary: { padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
  btnSecondary: { padding: "10px 24px", background: "#fff", color: "#111", border: "2px solid #111", borderRadius: "6px", fontWeight: "600", fontSize: "14px", cursor: "pointer" },
};
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/client";

export default function DepotDossier() {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicle = location.state?.vehicle;
  const mode = location.state?.mode;

  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [idCard, setIdCard] = useState(null);
  const [proofOfAddress, setProofOfAddress] = useState(null);
  const [incomeProof, setIncomeProof] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(endDate) - new Date(startDate)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const total = days * (vehicle?.price || 0);

  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Formats acceptés : PDF, JPG ou PNG.");
      return false;
    }

    if (file.size > maxSize) {
      setError("Chaque fichier doit faire moins de 5 Mo.");
      return false;
    }

    return true;
  };

  const handleFileChange = (setter) => (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setter(null);
      return;
    }

    if (!validateFile(file)) {
      event.target.value = "";
      setter(null);
      return;
    }

    setError("");
    setter(file);
  };

  const uploadDocuments = async (dossierId) => {
    const formData = new FormData();

    formData.append("id_card", idCard);
    formData.append("proof_of_address", proofOfAddress);
    formData.append("income_proof", incomeProof);

    await API.patch(`/dossiers/${dossierId}/documents`, formData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "rental" && (!startDate || !endDate || days <= 0)) {
      setError("Veuillez sélectionner des dates valides.");
      return;
    }

    if (!idCard || !proofOfAddress || !incomeProof) {
      setError("Veuillez ajouter les trois justificatifs demandés.");
      return;
    }

    try {
      setSubmitting(true);

      const dossierResponse = await API.post("/dossiers/", {
        vehicle_id: vehicle.id,
        dossier_type: mode === "rental" ? "rental" : "purchase",
        notes,
        start_date: mode === "rental" ? startDate : null,
        end_date: mode === "rental" ? endDate : null,
        total_price: mode === "rental" ? total : vehicle.price,
      });

      await uploadDocuments(dossierResponse.data.id);

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Erreur lors du dépôt du dossier."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Connexion requise</h2>
          <p>Vous devez être connecté pour déposer un dossier.</p>
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={() => navigate("/login")}
          >
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
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={() => navigate("/vehicles")}
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>

          <h2 style={{ color: "#16A34A" }}>Dossier déposé</h2>

          <p style={{ color: "#64748B" }}>
            Votre dossier pour le{" "}
            <strong>
              {vehicle.brand} {vehicle.model}
            </strong>{" "}
            a été transmis avec les justificatifs.
            {mode === "rental" && total > 0 && (
              <span>
                {" "}
                Montant total :{" "}
                <strong>€{total.toLocaleString("fr-FR")}</strong>
              </span>
            )}
          </p>

          <div style={styles.actionsRow}>
            <button
              type="button"
              style={styles.btnPrimary}
              onClick={() => navigate("/dossiers")}
            >
              Suivre mon dossier
            </button>

            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => navigate("/vehicles")}
            >
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
        <h2 style={styles.title}>
          {mode === "rental" ? "Dossier de location" : "Dossier d'achat"}
        </h2>

        <div style={styles.vehicleSummary}>
          {vehicle.image_url && (
            <img
              src={vehicle.image_url}
              alt={`${vehicle.brand} ${vehicle.model}`}
              style={styles.vehicleImg}
            />
          )}

          <div>
            <div style={styles.vehicleName}>
              {vehicle.brand} {vehicle.model}
            </div>

            <div style={styles.vehicleInfo}>
              {vehicle.year} ·{" "}
              {Number(vehicle.mileage).toLocaleString("fr-FR")} km
            </div>

            <div style={styles.vehiclePrice}>
              {mode === "rental"
                ? `€${vehicle.price}/jour`
                : `€${Number(vehicle.price).toLocaleString("fr-FR")}`}
            </div>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "rental" && (
            <div style={styles.datesSection}>
              <div style={styles.field}>
                <label style={styles.label}>Date de début</label>
                <input
                  type="date"
                  style={styles.input}
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Date de fin</label>
                <input
                  type="date"
                  style={styles.input}
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {days > 0 && (
                <div style={styles.priceCalc}>
                  <span>
                    {days} jour{days > 1 ? "s" : ""} × €{vehicle.price}/jour
                  </span>
                  <span style={styles.priceTotal}>
                    = €{total.toLocaleString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>
              Message / informations complémentaires
            </label>
            <textarea
              style={{ ...styles.input, height: "100px", resize: "vertical" }}
              placeholder="Précisez vos besoins..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Justificatifs obligatoires</label>

            <div style={styles.uploadZone}>
              <label style={styles.fileLabel}>
                Pièce d'identité
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange(setIdCard)}
                  style={styles.fileInput}
                  required
                />
                {idCard && <span style={styles.fileName}>{idCard.name}</span>}
              </label>

              <label style={styles.fileLabel}>
                Justificatif de domicile
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange(setProofOfAddress)}
                  style={styles.fileInput}
                  required
                />
                {proofOfAddress && (
                  <span style={styles.fileName}>{proofOfAddress.name}</span>
                )}
              </label>

              <label style={styles.fileLabel}>
                Justificatif de revenus
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange(setIncomeProof)}
                  style={styles.fileInput}
                  required
                />
                {incomeProof && (
                  <span style={styles.fileName}>{incomeProof.name}</span>
                )}
              </label>

              <p style={styles.uploadHint}>
                Formats acceptés : PDF, JPG, PNG — 5 Mo maximum par fichier.
              </p>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={submitting}
            >
              {submitting ? "Envoi en cours..." : "Déposer mon dossier"}
            </button>

            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => navigate("/vehicles")}
              disabled={submitting}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    padding: "40px 24px",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "600px",
    margin: "0 auto",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "24px",
    color: "#111",
  },
  vehicleSummary: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    background: "#F8FAFC",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  vehicleImg: {
    width: "100px",
    height: "65px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  vehicleName: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#111",
  },
  vehicleInfo: {
    fontSize: "13px",
    color: "#64748B",
    marginTop: "2px",
  },
  vehiclePrice: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#1D4ED8",
    marginTop: "4px",
  },
  datesSection: {
    background: "#F8FAFC",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  priceCalc: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#EFF6FF",
    borderRadius: "8px",
    padding: "12px 16px",
    marginTop: "12px",
    fontSize: "14px",
    color: "#1D4ED8",
  },
  priceTotal: {
    fontWeight: "800",
    fontSize: "18px",
  },
  uploadZone: {
    border: "2px dashed #CBD5E1",
    borderRadius: "8px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fileLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fileInput: {
    padding: "8px",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "13px",
  },
  fileName: {
    fontSize: "12px",
    color: "#16A34A",
    fontWeight: "500",
  },
  uploadHint: {
    color: "#64748B",
    fontSize: "12px",
    margin: 0,
  },
  error: {
    color: "#DC2626",
    fontSize: "14px",
    marginBottom: "16px",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    background: "#DCFCE7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#16A34A",
    margin: "0 auto 16px",
  },
  actionsRow: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "10px 24px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "#fff",
    color: "#111",
    border: "2px solid #111",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
};
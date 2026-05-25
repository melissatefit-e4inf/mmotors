import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    birth_date: "",
    gender: "",
    accept_terms: false,
    newsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const set = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.accept_terms) {
      setError("Veuillez accepter les Conditions Générales.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await API.post("/auth/register", {
        email: form.email,
        password: form.password,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        phone: form.phone,
        birth_date: form.birth_date,
        gender: form.gender,
      });
      navigate("/login");
    } catch {
      setError("Erreur lors de l'inscription.");
    }
  };

  return (
    <div style={styles.page}>
      {/* Decorative steering wheel + key (CSS only) */}
      <div style={styles.decorCircle} />

      <h1 style={styles.title}>Créer votre compte M-Motors</h1>
      <p style={styles.stepLabel}>
        <strong>Étape 1/3</strong> : Informations personnelles
      </p>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={styles.progressFill} />
      </div>

      {/* Form card */}
      <div style={styles.card}>
        {error && <p style={styles.error}>{error}</p>}

        {/* Row 1 : Prénom / Nom */}
        <div style={styles.row}>
          <input
            placeholder="Prénom"
            value={form.first_name}
            onChange={set("first_name")}
            style={styles.input}
          />
          <input
            placeholder="Nom"
            value={form.last_name}
            onChange={set("last_name")}
            style={styles.input}
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="E-mail *"
          value={form.email}
          onChange={set("email")}
          style={styles.inputFull}
        />

        {/* Téléphone */}
        <input
          type="tel"
          placeholder="Téléphone"
          value={form.phone}
          onChange={set("phone")}
          style={styles.inputFull}
        />

        {/* Row 2 : Mot de passe / Confirmer */}
        <div style={styles.row}>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={form.password}
              onChange={set("password")}
              style={{ ...styles.input, paddingRight: "120px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.showBtn}
            >
              Afficher/Masquer{" "}
              <span style={{ fontSize: "14px" }}>👁</span>
            </button>
          </div>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.confirm_password}
            onChange={set("confirm_password")}
            style={styles.input}
          />
        </div>

        {/* Row 3 : Date naissance / Genre */}
        <div style={styles.row}>
          <div style={styles.selectWrapper}>
            <select
              value={form.birth_date}
              onChange={set("birth_date")}
              style={styles.select}
            >
              <option value="">Date de naissance</option>
              {Array.from({ length: 80 }, (_, i) => {
                const year = new Date().getFullYear() - 18 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <span style={styles.selectArrow}>▾</span>
          </div>

          <div style={styles.genderBox}>
            {["Homme", "Femme", "Autre"].map((g, i, arr) => (
              <span key={g} style={{ display: "flex", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, gender: g }))}
                  style={{
                    ...styles.genderBtn,
                    fontWeight: form.gender === g ? "800" : "400",
                    textDecoration: form.gender === g ? "underline" : "none",
                  }}
                >
                  {g}
                </button>
                {i < arr.length - 1 && (
                  <span style={{ color: "#999", margin: "0 4px" }}>/</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <label style={styles.checkRow}>
          <input
            type="checkbox"
            checked={form.accept_terms}
            onChange={set("accept_terms")}
            style={styles.checkbox}
          />
          <span style={styles.checkLabel}>
            J'accepte les{" "}
            <a href="#" style={styles.checkLink}>
              Conditions Générales de Vente
            </a>{" "}
            et{" "}
            <a href="#" style={styles.checkLink}>
              d'Utilisation
            </a>
          </span>
        </label>

        <label style={styles.checkRow}>
          <input
            type="checkbox"
            checked={form.newsletter}
            onChange={set("newsletter")}
            style={styles.checkbox}
          />
          <span style={styles.checkLabel}>
            S'inscrire à la newsletter de M-Motors (promotions, nouveautés)
          </span>
        </label>

        {/* Submit */}
        <button onClick={handleSubmit} style={styles.submitBtn}>
          S'INSCRIRE ET CONTINUER &nbsp;›
        </button>
      </div>

      {/* Already have account */}
      <p style={styles.loginHint}>
        Vous avez déjà un compte ?{" "}
        <Link to="/login" style={styles.loginLink}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = {
  page: {
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 16px 80px",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  /* Decorative background circle */
  decorCircle: {
    position: "absolute",
    top: "40px",
    right: "80px",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    border: "28px solid rgba(0,0,0,0.06)",
    pointerEvents: "none",
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: "8px",
  },

  stepLabel: {
    fontSize: "14px",
    color: "#444",
    marginBottom: "10px",
    textAlign: "center",
  },

  /* Progress */
  progressTrack: {
    width: "100%",
    maxWidth: "580px",
    height: "4px",
    background: "#ddd",
    borderRadius: "2px",
    marginBottom: "20px",
  },
  progressFill: {
    width: "33%",
    height: "100%",
    background: "#111",
    borderRadius: "2px",
  },

  /* Card */
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "28px 32px",
    width: "100%",
    maxWidth: "580px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  error: {
    color: "#cc0000",
    fontSize: "13px",
    textAlign: "center",
  },

  /* Rows */
  row: {
    display: "flex",
    gap: "12px",
  },

  /* Inputs */
  input: {
    flex: 1,
    padding: "16px 14px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    color: "#222",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    minWidth: 0,
  },
  inputFull: {
    width: "100%",
    padding: "16px 14px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    color: "#222",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },

  /* Password field */
  passwordWrapper: {
    flex: 1,
    position: "relative",
    minWidth: 0,
  },
  showBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "11px",
    color: "#555",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  /* Select */
  selectWrapper: {
    flex: 1,
    position: "relative",
    minWidth: 0,
  },
  select: {
    width: "100%",
    padding: "16px 36px 16px 14px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    appearance: "none",
    fontFamily: "inherit",
    color: "#444",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  selectArrow: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "#666",
    fontSize: "16px",
  },

  /* Gender selector */
  genderBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    padding: "0 12px",
    gap: "2px",
    backgroundColor: "#fff",
  },
  genderBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#222",
    fontFamily: "inherit",
    padding: "4px 2px",
  },

  /* Checkboxes */
  checkRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    marginTop: "2px",
    accentColor: "#111",
    cursor: "pointer",
    flexShrink: 0,
  },
  checkLabel: {
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.5",
  },
  checkLink: {
    color: "#111",
    fontWeight: "600",
    textDecoration: "underline",
  },

  /* Submit */
  submitBtn: {
    width: "100%",
    padding: "20px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    cursor: "pointer",
    marginTop: "4px",
    transition: "background 0.2s",
  },

  /* Bottom hint */
  loginHint: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#444",
  },
  loginLink: {
    color: "#111",
    fontWeight: "700",
    textDecoration: "underline",
  },
};

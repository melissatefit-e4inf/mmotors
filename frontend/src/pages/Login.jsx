import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/client";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/vehicles");
    } catch {
      setError("Identifiants invalides");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Connexion</h1>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.form}>
          <input
            type="text"
            placeholder="Email ou Identifiant..."
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Mot de passe..."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={styles.input}
          />

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button onClick={handleSubmit} style={styles.submitBtn}>
            SE CONNECTER
          </button>

          <div style={styles.registerBox}>
            <span style={styles.registerText}>
              Pas encore membre ?{" "}
              <Link to="/register" style={styles.registerLink}>
                S'inscrire
              </Link>
            </span>
          </div>
        </div>
      </div>
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
    paddingTop: "80px",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0px",
  },

  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111",
    marginBottom: "28px",
    textAlign: "center",
  },

  error: {
    color: "#cc0000",
    fontSize: "14px",
    marginBottom: "12px",
    textAlign: "center",
  },

  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    width: "100%",
    padding: "18px 20px",
    fontSize: "15px",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#333",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-4px",
  },

  forgotLink: {
    fontSize: "13px",
    color: "#333",
    textDecoration: "underline",
    cursor: "pointer",
  },

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
    marginTop: "8px",
    transition: "background 0.2s",
  },

  registerBox: {
    width: "100%",
    border: "1.5px solid #ccc",
    borderRadius: "8px",
    padding: "22px 20px",
    textAlign: "center",
    backgroundColor: "#fff",
    marginTop: "4px",
    boxSizing: "border-box",
  },

  registerText: {
    fontSize: "15px",
    color: "#333",
  },

  registerLink: {
    color: "#111",
    fontWeight: "700",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

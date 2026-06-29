import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <nav style={styles.nav}>
      <Link to={isAdmin ? "/admin" : "/vehicles"} style={styles.logo}>
        M-Motors
      </Link>

      <div style={styles.navLinks}>
        {isAdmin ? (
          <Link to="/admin" style={styles.navLink}>
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/vehicles" style={styles.navLink}>
              Véhicules
            </Link>

            {token && (
              <Link to="/dossiers" style={styles.navLink}>
                Mes dossiers
              </Link>
            )}
          </>
        )}
      </div>

      <div style={styles.authLinks}>
        {!token ? (
          <>
            <Link to="/login" style={styles.authLink}>
              Connexion
            </Link>

            <Link to="/register" style={styles.registerLink}>
              Inscription
            </Link>
          </>
        ) : (
          <button type="button" onClick={logout} style={styles.logoutBtn}>
            Déconnexion
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#222222",
    padding: "0 32px",
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    flexWrap: "wrap",
    gap: "16px",
  },
  logo: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "20px",
    textDecoration: "none",
    letterSpacing: "0.5px",
    minWidth: "120px",
  },
  navLinks: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
  },
  navLink: {
    color: "#f3f3f3",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
  },
  authLinks: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  authLink: {
    color: "#f3f3f3",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  registerLink: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    border: "1.5px solid rgba(255,255,255,0.6)",
    borderRadius: "20px",
    padding: "6px 18px",
  },
  logoutBtn: {
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.6)",
    color: "#ffffff",
    padding: "6px 18px",
    cursor: "pointer",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
};
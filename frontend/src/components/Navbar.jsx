import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token  = localStorage.getItem("token");
  const role   = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to={role === "admin" ? "/admin" : "/vehicles"} style={styles.logo}>
        M-Motors
      </Link>

      <div style={styles.navLinks}>
        {role === "admin" ? (
          <Link to="/admin" style={styles.navLink}>Dashboard</Link>
        ) : (
          <>
            <Link to="/vehicles" style={styles.navLink}>Véhicules</Link>
            {token && <Link to="/dossiers" style={styles.navLink}>Mes dossiers</Link>}
          </>
        )}
      </div>

      <div style={styles.authLinks}>
        {!token ? (
          <>
            <Link to="/login" style={styles.authLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Connexion
            </Link>
            <Link to="/register" style={styles.registerLink}>Inscription</Link>
          </>
        ) : (
          <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav:          { background: "#222222", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" },
  logo:         { color: "#ffffff", fontWeight: "800", fontSize: "20px", textDecoration: "none", letterSpacing: "0.5px", minWidth: "120px" },
  navLinks:     { display: "flex", gap: "32px", position: "absolute", left: "50%", transform: "translateX(-50%)" },
  navLink:      { color: "#ffffff", textDecoration: "none", fontSize: "15px", fontWeight: "500", opacity: 0.9 },
  authLinks:    { display: "flex", alignItems: "center", gap: "20px", minWidth: "200px", justifyContent: "flex-end" },
  authLink:     { color: "#ffffff", textDecoration: "none", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", opacity: 0.9 },
  registerLink: { color: "#ffffff", textDecoration: "none", fontSize: "14px", fontWeight: "600", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: "20px", padding: "6px 18px" },
  logoutBtn:    { background: "transparent", border: "1.5px solid rgba(255,255,255,0.6)", color: "#ffffff", padding: "6px 18px", cursor: "pointer", borderRadius: "20px", fontSize: "14px", fontWeight: "600" },
};
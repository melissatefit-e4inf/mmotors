import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav style={{
      background: "#1D4ED8",
      padding: "12px 24px",
      display: "flex",
      gap: "20px",
      alignItems: "center"
    }}>
      <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
        M-Motors
      </span>
      <Link to="/vehicles" style={{ color: "white", textDecoration: "none" }}>
        Véhicules
      </Link>
      {token && (
        <Link to="/dossiers" style={{ color: "white", textDecoration: "none" }}>
          Mes dossiers
        </Link>
      )}
      {!token ? (
        <>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Connexion
          </Link>
          <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
            Inscription
          </Link>
        </>
      ) : (
        <button onClick={logout} style={{
          background: "transparent",
          border: "1px solid white",
          color: "white",
          padding: "4px 12px",
          cursor: "pointer",
          borderRadius: "4px"
        }}>
          Déconnexion
        </button>
      )}
    </nav>
  );
}

export default Navbar;
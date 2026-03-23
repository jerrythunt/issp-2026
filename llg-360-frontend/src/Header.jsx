import { Link } from "react-router-dom";

function Header() {
  return (
    <header
      style={{
        backgroundColor: "#052c5c",
        color: "white",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
        letterSpacing: "0.3px",
      }}
    >
      <div>LEBLANC LEADERSHIP GROUP</div>

      <nav style={{ display: "flex", gap: "12px" }}>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/questions" style={linkStyle}>Questions</Link>
        <Link to="/surveys" style={linkStyle}>Surveys</Link>
        <Link to="/assessments" style={linkStyle}>Assessments</Link>
      </nav>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "6px 10px",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "8px",
  fontSize: "0.9rem",
};

export default Header;
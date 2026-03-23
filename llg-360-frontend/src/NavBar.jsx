import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div
      style={{
        width: "100%",
        background: "#0b2d5c",
        color: "white",
        padding: "14px 24px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: "bold", letterSpacing: "0.5px" }}>
        LEBLANC LEADERSHIP GROUP
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/questions" style={linkStyle}>Questions</Link>
        <Link to="/surveys" style={linkStyle}>Surveys</Link>
        <Link to="/assessments" style={linkStyle}>Assessments</Link>
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  fontSize: "0.9rem",
};

export default NavBar;
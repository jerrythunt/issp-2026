import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi.js";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("david@leblancleadership.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await mockApi.login({ email, password });
      nav("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>LEBLANC ADMIN LOGIN</h2>

        {error ? <div style={styles.error}>{error}</div> : null}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={styles.label}>
            Email / Username
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={styles.smallRow}>
            <span style={styles.linkLike}>Forgot Password?</span>
          </div>
        </form>

        <div style={styles.footer}>Hosted securely in Canada</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f6f8",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    marginBottom: 16,
    letterSpacing: 1,
    fontSize: 18,
    textAlign: "center",
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 13,
    color: "#333",
  },
  input: {
    border: "1px solid #d7dbe0",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  button: {
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    cursor: "pointer",
    background: "#2b7a78",
    color: "white",
    fontWeight: 700,
  },
  smallRow: { display: "flex", justifyContent: "flex-end" },
  linkLike: { color: "#2b7a78", fontSize: 13, cursor: "pointer" },
  footer: { marginTop: 18, fontSize: 12, color: "#666", textAlign: "center" },
  error: {
    background: "#ffe7e7",
    border: "1px solid #ffb3b3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    color: "#7a0000",
    fontSize: 13,
  },
};

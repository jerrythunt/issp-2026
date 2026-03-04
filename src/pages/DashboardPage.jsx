import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi.js";

function StatusPill({ status }) {
  const map = {
    NOT_STARTED: { label: "Not Started", bg: "#fde2e2", fg: "#8a1f1f" },
    IN_PROGRESS: { label: "In Progress", bg: "#fff3cd", fg: "#7a5b00" },
    COMPLETED: { label: "Completed", bg: "#d1f7d6", fg: "#1c6b2a" },
  };
  const s = map[status] || { label: status, bg: "#eee", fg: "#333" };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontSize: 12,
        fontWeight: 700,
        display: "inline-block",
        minWidth: 110,
        textAlign: "center",
      }}
    >
      {s.label}
    </span>
  );
}

export default function DashboardPage() {
  const nav = useNavigate();
  const user = mockApi.getUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await mockApi.getAssessments();
      setRows(data);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function logout() {
    mockApi.logout();
    nav("/login");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>LEBLANC LEADERSHIP GROUP</div>
        <div style={styles.right}>
          <span style={styles.hello}>Hello, {user?.name || "Admin"}!</span>
          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <h2 style={{ margin: 0 }}>Active Assessments</h2>
          <button
            style={styles.primaryBtn}
            onClick={() => nav("/assessments/new")}
            >
            + New Assessment
            </button>

        </div>

        {loading ? <div style={styles.box}>Loading…</div> : null}

        {!loading && error ? (
          <div style={styles.box}>
            <div style={{ marginBottom: 10 }}>❌ {error}</div>
            <button style={styles.secondaryBtn} onClick={load}>
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div style={styles.box}>
            No assessments yet. Click <b>+ New Assessment</b> to create one.
          </div>
        ) : null}

        {!loading && !error && rows.length > 0 ? (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Client Name</th>
                  <th style={styles.th}>Date Sent</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{a.clientName}</td>
                    <td style={styles.td}>{a.dateSent}</td>
                    <td style={styles.td}>
                      <StatusPill status={a.status} />
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          style={styles.secondaryBtn}
                          onClick={() => nav(`/assessments/${a.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          style={styles.secondaryBtn}
                          onClick={() => mockApi.downloadReport(a.id)}
                        >
                          Download PDF
                        </button>
                      </div>

                      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                        {a.completedCount}/{a.totalCount} responses
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f6f8" },
  header: {
    background: "#0b2b4c",
    color: "white",
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },
  brand: { fontWeight: 800, letterSpacing: 0.5 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  hello: { color: "white", opacity: 0.95 },
  logout: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "transparent",
    color: "white",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
  },
  main: { maxWidth: 980, margin: "0 auto", padding: 18 },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  primaryBtn: {
    border: "none",
    background: "#35b66a",
    color: "white",
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },
  secondaryBtn: {
    border: "1px solid #d7dbe0",
    background: "white",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
  },
  box: {
    background: "white",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  tableWrap: {
    background: "white",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: 14,
    background: "#f1f4f7",
    fontSize: 13,
  },
  td: { padding: 14, borderTop: "1px solid #eef1f4", fontSize: 14 },
};

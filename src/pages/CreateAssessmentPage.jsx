import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi.js";

export default function CreateAssessmentPage() {
  const nav = useNavigate();
  const user = mockApi.getUser();

  const [clientName, setClientName] = useState("John Doe");
  const [clientEmail, setClientEmail] = useState("johndoe1234@email.ca");

  const [raters, setRaters] = useState([
    { email: "tonyosoprano@email.ca", relationship: "Boss" },
  ]);

  const [newRaterEmail, setNewRaterEmail] = useState("");
  const [newRaterRelationship, setNewRaterRelationship] = useState("Peer");

  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const canCreate = useMemo(() => {
    if (!clientName.trim()) return false;
    if (!clientEmail.trim()) return false;
    if (raters.length === 0) return false;
    if (!deadline) return false;
    return true;
  }, [clientName, clientEmail, raters, deadline]);

  function logout() {
    mockApi.logout();
    nav("/login");
  }

  function addRater() {
    const email = newRaterEmail.trim();
    if (!email) return;

    setRaters((prev) => [...prev, { email, relationship: newRaterRelationship }]);
    setNewRaterEmail("");
    setNewRaterRelationship("Peer");
  }

  function removeRater(index) {
    setRaters((prev) => prev.filter((_, i) => i !== index));
  }

  function onCancel() {
    nav("/dashboard");
  }

async function onCreate() {
  try {
    const payload = {
      clientName,
      clientEmail,
      deadline,
      raters,
    };

    await mockApi.createAssessment(payload);
    nav("/dashboard");
  } catch (err) {
    alert(err.message || "Failed to create assessment");
  }
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
        <h2 style={styles.h2}>Create New Assessment</h2>

        <div style={styles.card}>
          <div style={styles.formGrid}>
            {/* Left column */}
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={styles.label}>Client Name</label>
                <input
                  style={styles.input}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                />
              </div>

              <div>
                <label style={styles.label}>Client Email</label>
                <input
                  style={styles.input}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>

              <div>
                <label style={styles.label}>Assessment Deadline</label>
                <input
                  style={styles.dateInput}
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <div style={styles.helper}>
                  (Later you can swap this to a calendar UI — this is clean + reliable for now.)
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "grid", gap: 10 }}>
              <div style={styles.ratersHeader}>
                <span style={styles.ratersTitle}>Raters</span>
              </div>

              <div style={styles.ratersTable}>
                <div style={styles.ratersRowHeader}>
                  <div style={{ fontWeight: 800 }}>Email</div>
                  <div style={{ fontWeight: 800 }}>Relationship</div>
                  <div />
                </div>

                {raters.map((r, idx) => (
                  <div key={idx} style={styles.ratersRow}>
                    <div style={styles.ratersCell}>{r.email}</div>
                    <div style={styles.ratersCell}>{r.relationship}</div>
                    <button style={styles.removeBtn} onClick={() => removeRater(idx)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div style={styles.addRow}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={newRaterEmail}
                  onChange={(e) => setNewRaterEmail(e.target.value)}
                  placeholder="newrater@email.com"
                />
                <select
                  style={styles.select}
                  value={newRaterRelationship}
                  onChange={(e) => setNewRaterRelationship(e.target.value)}
                >
                  <option>Boss</option>
                  <option>Peer</option>
                  <option>Direct Report</option>
                  <option>Self</option>
                  <option>Other</option>
                </select>
              </div>

              <button style={styles.addBtn} onClick={addRater}>
                + Add Rater
              </button>
            </div>
          </div>

          <div style={styles.footerRow}>
            <button style={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
            <button style={{ ...styles.createBtn, opacity: canCreate ? 1 : 0.55 }} disabled={!canCreate} onClick={onCreate}>
              Create Assessment
            </button>
          </div>
        </div>
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
  main: { maxWidth: 1100, margin: "0 auto", padding: 18 },
  h2: {
    margin: "14px 0 12px",
    fontSize: 26,
    fontWeight: 900,
    textDecoration: "underline",
  },
  card: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 14px 40px rgba(0,0,0,0.12)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 18,
    alignItems: "start",
  },
  label: { display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6, color: "#333" },
  input: {
    width: "100%",
    border: "1px solid #d7dbe0",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    background: "#f3f3f3",
  },
  dateInput: {
    width: "100%",
    border: "1px solid #d7dbe0",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    background: "white",
  },
  helper: { marginTop: 6, fontSize: 12, color: "#666" },

  ratersHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  ratersTitle: { fontWeight: 900, color: "#333" },

  ratersTable: {
    border: "1px solid #d7dbe0",
    borderRadius: 12,
    overflow: "hidden",
    background: "white",
  },
  ratersRowHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 130px 40px",
    gap: 10,
    padding: "10px 12px",
    background: "#f1f4f7",
    fontSize: 13,
  },
  ratersRow: {
    display: "grid",
    gridTemplateColumns: "1fr 130px 40px",
    gap: 10,
    padding: "10px 12px",
    borderTop: "1px solid #eef1f4",
    alignItems: "center",
    fontSize: 13,
  },
  ratersCell: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  removeBtn: {
    border: "none",
    background: "#ffe7e7",
    color: "#7a0000",
    borderRadius: 10,
    padding: "6px 0",
    cursor: "pointer",
    fontWeight: 900,
  },

  addRow: { display: "flex", gap: 10 },
  select: {
    width: 160,
    border: "1px solid #d7dbe0",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    background: "white",
  },
  addBtn: {
    border: "none",
    borderRadius: 999,
    padding: "10px 12px",
    cursor: "pointer",
    background: "#2f7fe6",
    color: "white",
    fontWeight: 900,
  },

  footerRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    background: "#ff4b4b",
    color: "white",
    fontWeight: 900,
    minWidth: 160,
  },
  createBtn: {
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    background: "#49c24f",
    color: "white",
    fontWeight: 900,
    minWidth: 190,
  },
};

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockApi } from "../services/mockApi.js";

export default function AssessmentDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [a, setA] = useState(null);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await mockApi.getAssessmentById(id);
      setA(data);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", padding: 18 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <button style={btnSecondary} onClick={() => nav("/dashboard")}>
          ← Back
        </button>

        <div style={card}>
          {loading ? <div>Loading…</div> : null}

          {!loading && error ? (
            <div>
              <div style={{ marginBottom: 10 }}>❌ {error}</div>
              <button style={btnSecondary} onClick={load}>
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !error && a ? (
            <>
              <h2 style={{ marginTop: 0 }}>{a.clientName}</h2>

              <div style={grid}>
                <Info label="Date sent" value={a.dateSent} />
                <Info label="Status" value={a.status} />
                <Info label="Responses" value={`${a.completedCount}/${a.totalCount}`} />
                <Info label="Questions" value={`${a.questionsCount}`} />
                <Info label="Report" value={a.reportStatus} />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  style={btnPrimary}
                  onClick={() => alert("Generate report (wire later)")}
                >
                  Generate Report
                </button>

                <button style={btnSecondary} onClick={() => mockApi.downloadReport(a.id)}>
                  Download PDF
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoBox}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#12314b" }}>{value}</div>
    </div>
  );
}

const card = {
  background: "white",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  marginTop: 12,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const infoBox = {
  border: "1px solid #eef1f4",
  borderRadius: 12,
  padding: 12,
  background: "#fbfcfd",
};

const btnPrimary = {
  border: "none",
  background: "#2b7a78",
  color: "white",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 800,
};

const btnSecondary = {
  border: "1px solid #d7dbe0",
  background: "white",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

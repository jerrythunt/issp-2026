import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAssessments,
  markRaterSubmitted,
  getAssessmentResponses,
  deleteAssessment,
} from "./services/api";
import { getAssessmentProgress } from "./utils/assessmentStatus";
import { calculateScaledQuestionAverages } from "./utils/assessmentStats";

function Dashboard() {
  const [assessments, setAssessments] = useState([]);
  const [assessmentAverages, setAssessmentAverages] = useState({});

  const loadAssessments = async () => {
    try {
      const data = await getAssessments();
      setAssessments(data);

      const averagesMap = {};
      for (const assessment of data) {
        const responses = await getAssessmentResponses(assessment.id);
        averagesMap[assessment.id] = calculateScaledQuestionAverages(responses);
      }

      setAssessmentAverages(averagesMap);
    } catch (error) {
      console.error("Failed to load assessments:", error);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleDeleteAssessment = async (assessmentId) => {
    const confirmed = window.confirm("Delete this assessment?");
    if (!confirmed) return;

    try {
      await deleteAssessment(assessmentId);
      await loadAssessments();
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      alert(error.message || "Failed to delete assessment.");
    }
  };

  const getStatusStyle = (state) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      display: "inline-block",
      minWidth: "110px",
      textAlign: "center",
    };

    switch (state) {
      case "not-started":
        return { ...baseStyle, backgroundColor: "#ef4444", color: "white" };
      case "completed":
        return { ...baseStyle, backgroundColor: "#22c55e", color: "white" };
      case "in-progress":
        return { ...baseStyle, backgroundColor: "#facc15", color: "#111827" };
      default:
        return { ...baseStyle, backgroundColor: "#9ca3af", color: "white" };
    }
  };

  const handleMarkSubmitted = async (assessmentId, raterIndex) => {
    try {
      await markRaterSubmitted(assessmentId, raterIndex);
      await loadAssessments();
    } catch (error) {
      console.error("Failed to mark submitted:", error);
      alert(error.message || "Failed to update rater.");
    }
  };

  const getRaterUrl = (assessmentId, raterIndex) => {
    return `${window.location.origin}/rater/${assessmentId}/${raterIndex}`;
  };

  const handleCopyLink = async (assessmentId, raterIndex) => {
    const url = getRaterUrl(assessmentId, raterIndex);

    try {
      await navigator.clipboard.writeText(url);
      alert("Rater link copied!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert(url);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "40px 24px",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Hello, David!</h1>
            <p style={{ marginTop: "8px", color: "#4b5563" }}>
              Active Assessments
            </p>
          </div>

          <Link
            to="/assessments"
            style={{
              backgroundColor: "#67d34f",
              color: "white",
              textDecoration: "none",
              padding: "12px 20px",
              borderRadius: "999px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            + New Assessment
          </Link>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            padding: "28px",
          }}
        >
          {assessments.length === 0 ? (
            <p>No assessments found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                    <th style={thStyle}>Client Name</th>
                    <th style={thStyle}>Survey</th>
                    <th style={thStyle}>Deadline</th>
                    <th style={thStyle}>Responses</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => {
                    const progress = getAssessmentProgress(assessment);
                    return (
                      <tr key={assessment.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: "bold" }}>{assessment.clientName}</div>
                          <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                            {assessment.id}
                          </div>
                        </td>

                        <td style={tdStyle}>{assessment.surveyName}</td>
                        <td style={tdStyle}>{assessment.deadline}</td>
                        <td style={tdStyle}>
                          {progress.submitted}/{progress.total}
                        </td>
                        <td style={tdStyle}>
                          <span style={getStatusStyle(progress.state)}>
                            {progress.label}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <Link
                            to={`/assessments/${assessment.id}`}
                            style={grayBtn}
                        >
                            View Details
                        </Link>
                            <button 
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              style={redBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: "28px" }}>
                <h3 style={{ marginBottom: "16px", textAlign: "center" }}>Rater Links & Response Averages</h3>
                {assessments.map((assessment) => {
                  const averages = assessmentAverages[assessment.id] || [];
                  return (
                    <div
                      key={`${assessment.id}-details`}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        padding: "18px",
                        marginBottom: "18px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <h4 style={{ marginTop: 0, textAlign: "center" }}>{assessment.clientName}</h4>
                      <div style={{ marginBottom: "20px", textAlign: "center" }}>
                        <strong style={{ display: "block", marginBottom: "10px" }}>Raters:</strong>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {(assessment.raters || []).map((rater, index) => (
                            <li 
                              key={`${assessment.id}-${index}`} 
                              style={{ 
                                marginBottom: "20px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center" 
                              }}
                            >
                              <div style={{ marginBottom: "8px" }}>
                                {rater.name} ({rater.relationship}) —{" "}
                                <strong>{rater.submitted ? "Submitted" : "Pending"}</strong>
                              </div>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(assessment.id, index)}
                                  style={darkBtn}
                                >
                                  Copy Link
                                </button>
                                <a
                                  href={getRaterUrl(assessment.id, index)}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={lightBtn}
                                >
                                  Open Survey
                                </a>
                                {!rater.submitted && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSubmitted(assessment.id, index)}
                                    style={grayBtn}
                                  >
                                    Mark Submitted
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <strong style={{ display: "block", marginBottom: "10px" }}>Scaled Question Averages:</strong>
                        {averages.length === 0 ? (
                          <p style={{ color: "#6b7280" }}>
                            No submitted scaled responses yet.
                          </p>
                        ) : (
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {averages.map((item, index) => (
                              <li key={`${assessment.id}-avg-${index}`} style={{ marginBottom: "8px" }}>
                                <strong>{item.questionText}</strong>: {item.average} / 5
                                {" "}({item.responsesCount} response
                                {item.responsesCount !== 1 ? "s" : ""})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "14px 12px",
  fontSize: "0.9rem",
  color: "#4b5563",
};

const tdStyle = {
  padding: "16px 12px",
  verticalAlign: "top",
};

const darkBtn = {
  backgroundColor: "#111827",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: "pointer",
  textDecoration: "none",
};

const grayBtn = {
  backgroundColor: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const redBtn = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: "pointer",
  textDecoration: "none",
};

const lightBtn = {
  backgroundColor: "white",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "8px 12px",
  textDecoration: "none",
  display: "inline-block",
};

export default Dashboard;
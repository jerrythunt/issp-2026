import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSurveys,
  getAssessments,
  createAssessment,
  getAssessmentById,
  updateAssessment,
} from "./services/api";

function CreateAssessment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [surveys, setSurveys] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [deadline, setDeadline] = useState("");

  const [raterName, setRaterName] = useState("");
  const [raterEmail, setRaterEmail] = useState("");
  const [relationship, setRelationship] = useState("");

  const [raters, setRaters] = useState([]);

  const loadData = async () => {
    try {
      const surveysData = await getSurveys();
      const assessmentsData = await getAssessments();
      setSurveys(surveysData);
      setAssessments(assessmentsData);

      if (isEditMode) {
        const assessmentData = await getAssessmentById(id);
        setClientName(assessmentData.clientName || "");
        setClientEmail(assessmentData.clientEmail || "");
        setSurveyId(assessmentData.surveyId || "");
        setDeadline(assessmentData.deadline || "");
        const externalRaters = (assessmentData.raters || []).filter(r => r.relationship !== "Self");
        setRaters(externalRaters);
      }
    } catch (error) {
      console.error("Failed to load assessment data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddRater = () => {
    if (!raterName.trim() || !raterEmail.trim() || !relationship.trim()) {
      alert("Please fill in all rater fields.");
      return;
    }
    const newRater = { name: raterName, email: raterEmail, relationship, submitted: false };
    setRaters((prev) => [...prev, newRater]);
    setRaterName("");
    setRaterEmail("");
    setRelationship("");
  };

  const handleRemoveRater = (indexToRemove) => {
    setRaters((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

    if (!clientName || !clientEmail || !surveyId || !deadline) {
      alert("Please fill in all assessment fields.");
      return;
    }

    const allParticipants = [
      { name: clientName, email: clientEmail, relationship: "Self" },
      ...raters
    ];

    const payload = {
      clientName,
      clientEmail,
      surveyId,
      surveyName: selectedSurvey?.name || "",
      deadline,
      raters: allParticipants,
    };

    try {
      if (isEditMode) {
        await updateAssessment(id, payload);
        alert("Assessment updated successfully.");
      } else {
        await createAssessment(payload);
        alert("Assessment created successfully.");
      }
      navigate("/");
    } catch (error) {
      console.error("Failed to save assessment:", error);
      alert(error.message || "Failed to save assessment.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>{isEditMode ? "Edit Assessment" : "Create New Assessment"}</h1>
        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={gridStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Client Information</h2>
                <label style={labelStyle}>Client Name</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} placeholder="John Doe" />
                
                <label style={labelStyle}>Client Email</label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} style={inputStyle} placeholder="john@example.com" />
                
                <label style={labelStyle}>Survey</label>
                <select value={surveyId} onChange={(e) => setSurveyId(e.target.value)} style={inputStyle}>
                  <option value="">Select survey</option>
                  {surveys.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <label style={labelStyle}>Assessment Deadline</label>
                <div style={{ position: "relative" }}>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ ...inputStyle, paddingRight: "40px", colorScheme: "light" }} />
                  <span style={calendarIconStyle}>📅</span>
                </div>
              </div>

              <div>
                <h2 style={sectionTitleStyle}>Raters (Feedback Team)</h2>
                <div style={raterHeaderStyle}>
                  <span>Name</span><span>Email</span><span>Relationship</span>
                </div>
                <input type="text" value={raterName} onChange={(e) => setRaterName(e.target.value)} style={inputStyle} placeholder="Rater name" />
                <input type="email" value={raterEmail} onChange={(e) => setRaterEmail(e.target.value)} style={inputStyle} placeholder="rater@example.com" />
                
                {/* UPDATED: Relationship Select instead of Input */}
                <select 
                  value={relationship} 
                  onChange={(e) => setRelationship(e.target.value)} 
                  style={inputStyle}
                >
                  <option value="">Select Relationship</option>
                  <option value="Boss">Boss</option>
                  <option value="Peer">Peer</option>
                  <option value="Direct Report">Direct Report</option>
                  <option value="Other">Other</option>
                </select>
                
                <button type="button" onClick={handleAddRater} style={addRaterButtonStyle}>+ Add Rater</button>

                <div style={{ marginTop: "20px" }}>
                  {raters.length === 0 ? <p style={mutedTextStyle}>No external raters added yet.</p> : 
                    raters.map((rater, index) => (
                      <div key={index} style={raterCardStyle}>
                        <div>
                          <div style={raterNameStyle}>{rater.name}</div>
                          <div style={raterMetaStyle}>{rater.email} — {rater.relationship}</div>
                        </div>
                        <button type="button" onClick={() => handleRemoveRater(index)} style={removeButtonStyle}>Remove</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div style={actionsStyle}>
              <button type="button" onClick={() => navigate("/")} style={cancelButtonStyle}>Cancel</button>
              <button type="submit" style={saveButtonStyle}>{isEditMode ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const pageStyle = { minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "40px 24px" };
const containerStyle = { maxWidth: "1100px", margin: "0 auto" };
const titleStyle = { margin: "0 0 28px 0", fontSize: "2.2rem", color: "#111827" };
const cardStyle = { backgroundColor: "white", borderRadius: "18px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", padding: "32px" };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" };
const sectionTitleStyle = { marginTop: 0, marginBottom: "18px", color: "#374151", fontSize: "1.2rem" };
const labelStyle = { display: "block", marginBottom: "8px", marginTop: "14px", color: "#4b5563", fontWeight: "600" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", color: "#111827", fontSize: "0.95rem", boxSizing: "border-box", marginBottom: "10px" };
const calendarIconStyle = { position: "absolute", right: "12px", top: "45%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "18px", opacity: 0.7 };
const raterHeaderStyle = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "0.8rem", color: "#6b7280", marginBottom: "10px", borderBottom: "1px solid #d1d5db" };
const addRaterButtonStyle = { marginTop: "12px", width: "100%", padding: "12px", borderRadius: "999px", border: "none", backgroundColor: "#3b82f6", color: "white", fontWeight: "bold", cursor: "pointer" };
const raterCardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: "10px" };
const raterNameStyle = { fontWeight: "700", color: "#111827" };
const raterMetaStyle = { fontSize: "0.9rem", color: "#4b5563", marginTop: "4px" };
const removeButtonStyle = { backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" };
const actionsStyle = { display: "flex", justifyContent: "flex-end", gap: "14px", marginTop: "28px" };
const cancelButtonStyle = { backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "999px", padding: "12px 26px", fontWeight: "bold", cursor: "pointer" };
const saveButtonStyle = { backgroundColor: "#67d34f", color: "white", border: "none", borderRadius: "999px", padding: "12px 26px", fontWeight: "bold", cursor: "pointer" };
const mutedTextStyle = { color: "#6b7280" };

export default CreateAssessment;
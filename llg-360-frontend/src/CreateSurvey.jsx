import { useEffect, useState } from "react";
import {
  getQuestions,
  createSurvey,
  getSurveys,
  deleteSurvey,
} from "./services/api";

function CreateSurvey() {
  const [questions, setQuestions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [surveyName, setSurveyName] = useState("");

  const loadData = async () => {
    try {
      const questionsData = await getQuestions();
      const surveysData = await getSurveys();
      setQuestions(questionsData);
      setSurveys(surveysData);
    } catch (error) {
      console.error("Failed to load survey data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((questionId) => questionId !== id)
        : [...prev, id]
    );
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();

    if (!surveyName.trim()) {
      alert("Please enter a survey name.");
      return;
    }

    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }

    try {
      await createSurvey(surveyName, selectedQuestions);
      setSurveyName("");
      setSelectedQuestions([]);
      await loadData();
      alert("Survey created successfully.");
    } catch (error) {
      console.error("Failed to create survey:", error);
      alert("Failed to create survey.");
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    const confirmed = window.confirm("Delete this survey?");
    if (!confirmed) return;

    try {
      await deleteSurvey(surveyId);
      await loadData();
      alert("Survey deleted successfully.");
    } catch (error) {
      console.error("Failed to delete survey:", error);
      alert(error.message || "Failed to delete survey.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Survey Management</h1>

        <div style={cardStyle}>
          <form onSubmit={handleCreateSurvey}>
            <div style={gridStyle}>
              {/* Left Column: Create Survey */}
              <div>
                <h2 style={sectionTitleStyle}>Create New Survey</h2>
                
                <label style={labelStyle}>Survey Name</label>
                <input
                  type="text"
                  placeholder="Enter survey name"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  style={inputStyle}
                />

                <h2 style={{ ...sectionTitleStyle, marginTop: "24px" }}>Select Questions</h2>
                {questions.length === 0 ? (
                  <p style={mutedTextStyle}>No questions found.</p>
                ) : (
                  <div style={questionListContainer}>
                    {questions.map((q) => (
                      <label key={q.id} style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(q.id)}
                          onChange={() => handleCheckboxChange(q.id)}
                          style={checkboxStyle}
                        />
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={questionTextStyle}>{q.text}</div>
                          <div style={questionTypeStyle}>{q.type}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div style={actionsStyle}>
                  <button type="submit" style={saveButtonStyle}>
                    Create Survey
                  </button>
                </div>
              </div>

              {/* Right Column: Existing Surveys */}
              <div>
                <h2 style={sectionTitleStyle}>Existing Surveys</h2>
                <div style={surveyListContainer}>
                  {surveys.length === 0 ? (
                    <p style={mutedTextStyle}>No surveys created yet.</p>
                  ) : (
                    surveys.map((survey) => (
                      <div key={survey.id} style={raterCardStyle}>
                        <div>
                          <div style={raterNameStyle}>{survey.name}</div>
                          <div style={raterMetaStyle}>
                            {survey.questionIds?.length || 0} questions
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSurvey(survey.id)}
                          style={removeButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Style Object ---

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  padding: "40px 24px",
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const titleStyle = {
  margin: "0 0 28px 0",
  fontSize: "2.2rem",
  color: "#111827",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  padding: "32px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#374151",
  fontSize: "1.2rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#4b5563",
  fontWeight: "600",
  fontSize: "0.95rem",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #111827", // Made border darker to match screenshot
  backgroundColor: "#f9fafb",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  color: "#111827",             // FIXED: Set text color to dark
  fontWeight: "600",           // Matched screenshot weight
};

const questionListContainer = {
  maxHeight: "400px",
  overflowY: "auto",
  padding: "10px",
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  padding: "14px",
  marginBottom: "8px",
  borderRadius: "12px",
  cursor: "pointer",
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
};

const checkboxStyle = {
  marginRight: "12px",
  width: "18px",
  height: "18px",
  cursor: "pointer",
};

const questionTextStyle = {
  fontSize: "0.95rem",
  fontWeight: "700",
  color: "#111827",
};

const questionTypeStyle = {
  fontSize: "0.75rem",
  color: "#6b7280",
  textTransform: "uppercase",
  marginTop: "2px",
};

const surveyListContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const raterCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
};

const raterNameStyle = {
  fontWeight: "800",
  fontSize: "1.1rem",
  color: "#111827",
};

const raterMetaStyle = {
  fontSize: "0.9rem",
  color: "#4b5563",
  marginTop: "4px",
};

const removeButtonStyle = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "700",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-start",
  marginTop: "24px",
};

const saveButtonStyle = {
  backgroundColor: "#67d34f",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "12px 32px",
  fontWeight: "800",
  fontSize: "1rem",
  cursor: "pointer",
};

const mutedTextStyle = {
  color: "#6b7280",
  fontSize: "0.9rem",
};

export default CreateSurvey;
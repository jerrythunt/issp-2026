import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssessmentById,
  getFullSurvey,
  submitAssessmentResponses,
} from "./services/api";

function RaterSurvey() {
  const { assessmentId, raterIndex } = useParams();

  const [assessment, setAssessment] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittedLocally, setSubmittedLocally] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const assessmentData = await getAssessmentById(assessmentId);
        const surveyData = await getFullSurvey(assessmentData.surveyId);
        setAssessment(assessmentData);
        setSurvey(surveyData);
      } catch (error) {
        console.error("Failed to load rater survey:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!survey || !survey.questions) return;

    const formattedAnswers = survey.questions.map((question) => ({
      questionId: question.id,
      questionText: question.text,
      type: question.type,
      value: answers[question.id] || "", 
    }));

    try {
      await submitAssessmentResponses(assessmentId, {
        raterIndex: Number(raterIndex),
        answers: formattedAnswers,
      });
      setSubmittedLocally(true);
    } catch (error) {
      console.error("Submit failed:", error);
      alert(error.message);
    }
  };

  if (loading) return <div style={msgStyle}>Loading survey...</div>;
  
  const currentRater = assessment?.raters?.[Number(raterIndex)];

  // Success State
  if (submittedLocally || currentRater?.submitted) {
    return (
      <div style={pageStyle}>
        <div style={headerBar}>LEBLANC LEADERSHIP GROUP</div>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "#111827" }}>Thank You, {currentRater?.name}!</h2>
            <p style={{ color: "#4b5563" }}>Your feedback for <strong>{assessment?.clientName}</strong> has been successfully submitted.</p>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginTop: "20px" }}>You may now close this window.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !survey) return <div style={msgStyle}>Survey not found.</div>;

  return (
    <div style={pageStyle}>
      <div style={headerBar}>
        LEBLANC LEADERSHIP GROUP
      </div>

      <div style={containerStyle}>
        <div style={introCard}>
          <h1 style={{ margin: "0 0 10px 0", color: "#111827" }}>Clarity Index 360</h1>
          <p style={{ color: "#4b5563", margin: 0 }}>
            Providing feedback for: <strong>{assessment.clientName}</strong>
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "5px" }}>
            Relationship: {currentRater?.relationship || "Participant"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {survey.questions.map((question) => (
            <div key={question.id} style={questionCard}>
              <p style={questionTextStyle}>
                {question.text}
              </p>

              {question.type === "scaled" ? (
                <div style={scaleContainer}>
                  {[1, 2, 3, 4, 5, "N/O"].map((num) => (
                    <label key={num} style={radioLabel(answers[question.id] === String(num))}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={num}
                        checked={answers[question.id] === String(num)}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                        style={{ display: "none" }}
                      />
                      {num}
                    </label>
                  ))}
                  <div style={scaleLabels}>
                    <span>Strongly Disagree</span>
                    <span style={{ marginLeft: "45px" }}>Not Observed</span>
                    <span>Strongly Agree</span>
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="Share your thoughts here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  rows="4"
                  style={textareaStyle}
                />
              )}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button 
              type="submit" 
              disabled={survey.questions.length === 0}
              style={submitBtnStyle(survey.questions.length === 0)}
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Styles ---
const pageStyle = { minHeight: "100vh", backgroundColor: "#f3f4f6", paddingBottom: "80px" };
const headerBar = { backgroundColor: "#002147", color: "white", padding: "20px 40px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "40px", textAlign: "left" };
const containerStyle = { maxWidth: "700px", margin: "0 auto", padding: "0 20px" };
const introCard = { marginBottom: "30px", borderBottom: "2px solid #e5e7eb", paddingBottom: "20px" };
const questionCard = { backgroundColor: "white", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "24px" };
const questionTextStyle = { marginTop: 0, marginBottom: "20px", fontSize: "1.1rem", color: "#111827", fontWeight: "600", lineHeight: "1.5" };

// UPDATED: Text color changed to dark grey (#111827) so typing is visible
const textareaStyle = { 
  width: "100%", 
  padding: "15px", 
  borderRadius: "12px", 
  border: "1px solid #d1d5db", 
  backgroundColor: "#f9fafb", 
  color: "#111827", 
  fontSize: "1rem", 
  fontFamily: "inherit", 
  boxSizing: "border-box" 
};

const msgStyle = { padding: "100px", textAlign: "center", color: "#4b5563", fontSize: "1.2rem" };
const cardStyle = { backgroundColor: "white", maxWidth: "500px", margin: "40px auto", padding: "40px", borderRadius: "18px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" };

const scaleContainer = { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", position: "relative" };
const scaleLabels = { display: "flex", justifyContent: "space-between", width: "100%", marginTop: "10px", fontSize: "0.75rem", color: "#6b7280" };

const radioLabel = (isSelected) => ({
  flex: 1,
  textAlign: "center",
  padding: "15px 0",
  borderRadius: "10px",
  cursor: "pointer",
  border: isSelected ? "2px solid #67d34f" : "1px solid #d1d5db",
  backgroundColor: isSelected ? "#f0fdf4" : "white",
  color: isSelected ? "#166534" : "#111827",
  fontWeight: "bold",
  transition: "all 0.2s ease",
  minWidth: "45px" 
});

const submitBtnStyle = (isDisabled) => ({
  backgroundColor: isDisabled ? "#9ca3af" : "#67d34f",
  color: "white",
  padding: "16px 40px",
  borderRadius: "999px",
  border: "none",
  fontSize: "1.1rem",
  fontWeight: "bold",
  cursor: isDisabled ? "not-allowed" : "pointer",
  boxShadow: "0 4px 14px rgba(103, 211, 79, 0.4)"
});

export default RaterSurvey;
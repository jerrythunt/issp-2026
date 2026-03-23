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

  useEffect(() => {
    async function loadData() {
      try {
        const assessmentData = await getAssessmentById(assessmentId);
        const surveyData = await getFullSurvey(assessmentData.surveyId);
        
        // Added log here to inspect the survey structure
        console.log("Loaded survey:", surveyData);

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
      answer: answers[question.id] || "",
    }));

    try {
      await submitAssessmentResponses(assessmentId, {
        raterIndex: Number(raterIndex),
        answers: formattedAnswers,
      });

      alert("Survey submitted successfully.");
    } catch (error) {
      console.error("Submit failed:", error);
      alert(error.message);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!assessment || !survey) return <p style={{ padding: "2rem" }}>Failed to load survey.</p>;

  const currentRater = assessment.raters?.[Number(raterIndex)];

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Leadership 360 Survey</h1>
      <p><strong>Client:</strong> {assessment.clientName}</p>
      <p><strong>Survey:</strong> {survey.name}</p>
      <p><strong>Rater:</strong> {currentRater?.name || "Unknown"}</p>

      <form onSubmit={handleSubmit}>
        {survey.questions.map((question) => (
          <div
            key={question.id}
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          >
            <p style={{ marginTop: 0 }}>
              <strong>{question.text}</strong>
            </p>

            {question.type === "scaled" ? (
              <select
                value={answers[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
              >
                <option value="">Select rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            ) : (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                rows="4"
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}

        {survey.questions.length === 0 && (
          <p>No questions found for this survey.</p>
        )}

        <button 
          type="submit" 
          disabled={survey.questions.length === 0}
          style={{ padding: "10px 20px", cursor: survey.questions.length === 0 ? "not-allowed" : "pointer" }}
        >
          Submit Survey
        </button>
      </form>
    </div>
  );
}

export default RaterSurvey;
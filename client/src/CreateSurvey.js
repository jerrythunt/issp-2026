import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestions, createSurvey } from "./firestore";

function CreateSurvey() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [surveyName, setSurveyName] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadQuestions();
  }, []);

  const handleSelectQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((qid) => qid !== id)
        : [...prev, id]
    );
  };

  const handleCreateSurvey = async () => {
    if (!surveyName) {
      alert("Please enter a survey name.");
      return;
    }

    try {
      const surveyId = await createSurvey(surveyName, selectedQuestions);
      alert(`Survey "${surveyName}" created with ID: ${surveyId}`);
      setSurveyName("");
      setSelectedQuestions([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create survey: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Survey</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Enter survey name"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          style={{ width: "400px", marginRight: "10px" }}
        />
      </div>

      <p>Select questions to include:</p>
      {questions.length === 0 ? (
        <p>No questions available. Add some first!</p>
      ) : (
        <ul>
          {questions.map((q) => (
            <li key={q.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(q.id)}
                  onChange={() => handleSelectQuestion(q.id)}
                  style={{ marginRight: "8px" }}
                />
                {q.text} ({q.type})
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleCreateSurvey}
        style={{ marginTop: "20px", marginRight: "10px" }}
        disabled={selectedQuestions.length === 0 || !surveyName}
      >
        Create Survey
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "20px" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default CreateSurvey;

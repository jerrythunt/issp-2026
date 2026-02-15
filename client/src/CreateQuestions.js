import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addQuestion, fetchQuestions, deleteQuestion } from "./firestore";

function CreateQuestions() {
  const navigate = useNavigate();
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("scaled"); // default type
  const [questions, setQuestions] = useState([]);

  // Load existing questions
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

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText) return;

    try {
      await addQuestion(questionText, questionType); // pass type
      setQuestionText("");
      setQuestionType("scaled");
      const updated = await fetchQuestions();
      setQuestions(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to add question: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      const updated = await fetchQuestions();
      setQuestions(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to delete question: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Questions</h2>

      {/* Add Question Form */}
      <form onSubmit={handleAddQuestion}>
        <input
          type="text"
          placeholder="Enter new question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ width: "400px", marginRight: "10px" }}
        />

        {/* Dropdown for type */}
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="scaled">Scaled (1-5)</option>
          <option value="text">Text Box</option>
        </select>

        <button type="submit">Add Question</button>
      </form>

      {/* Existing Questions */}
      <h3 style={{ marginTop: "20px" }}>Existing Questions:</h3>
      {questions.length === 0 ? (
        <p>No questions yet. Add one above!</p>
      ) : (
        <ul>
          {questions.map((q) => (
            <li key={q.id}>
              {q.text} ({q.type})
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Back to Dashboard */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "20px" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default CreateQuestions;

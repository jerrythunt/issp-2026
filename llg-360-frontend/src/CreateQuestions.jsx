import { useEffect, useState } from "react";
import {
  getQuestions,
  createQuestion,
  deleteQuestion,
} from "./services/api";

function CreateQuestions() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("scaled");

  const loadQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to load questions:", error);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please enter question text.");
      return;
    }

    try {
      await createQuestion(text, type);
      setText("");
      setType("scaled");
      await loadQuestions();
    } catch (error) {
      console.error("Create failed:", error);
      alert("Failed to add question");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      await deleteQuestion(id);
      await loadQuestions();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete question");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Question Management</h1>

        <div style={cardStyle}>
          <div style={gridStyle}>
            {/* Left Column: Create Question */}
            <div>
              <h2 style={sectionTitleStyle}>Add New Question</h2>
              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Question Text</label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., How effective is the communication?"
                  style={inputStyle}
                />

                <label style={labelStyle}>Response Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="scaled">Scaled (1-5)</option>
                  <option value="text">Open Text</option>
                </select>

                <div style={actionsStyle}>
                  <button type="submit" style={saveButtonStyle}>
                    + Add Question
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: List of Questions */}
            <div>
              <h2 style={sectionTitleStyle}>Current Questions</h2>
              <div style={listContainerStyle}>
                {questions.length === 0 ? (
                  <p style={mutedTextStyle}>No questions found.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} style={questionItemStyle}>
                      <div style={{ flex: 1 }}>
                        <div style={questionTextStyle}>{q.text}</div>
                        <div style={questionTypeStyle}>{q.type}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(q.id)}
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
  border: "1px solid #111827",
  backgroundColor: "#f9fafb",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  color: "#111827", // Ensuring text is visible
  fontWeight: "600",
  marginBottom: "20px",
};

const listContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  maxHeight: "500px",
  overflowY: "auto",
};

const questionItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
};

const questionTextStyle = {
  fontWeight: "800",
  fontSize: "1.05rem",
  color: "#111827",
};

const questionTypeStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
  textTransform: "uppercase",
  marginTop: "4px",
  fontWeight: "600",
};

const removeButtonStyle = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "700",
  marginLeft: "15px",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-start",
  marginTop: "10px",
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

export default CreateQuestions;
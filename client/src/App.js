import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateQuestions from "./CreateQuestions"; 
import CreateSurvey from "./CreateSurvey";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-questions" element={<CreateQuestions />} /> {/* new route */}
      <Route path="/create-survey" element={<CreateSurvey />} /> {/* new route */}
      <Route path="*" element={<Login />} /> {/* default to login */}
    </Routes>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Dashboard from "./Dashboard";
import CreateQuestions from "./CreateQuestions";
import CreateSurvey from "./CreateSurvey";
import CreateAssessment from "./CreateAssessment";
import RaterSurvey from "./RaterSurvey";
import AssessmentDetails from "./AssessmentDetails";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/questions" element={<CreateQuestions />} />
        <Route path="/surveys" element={<CreateSurvey />} />
        <Route path="/assessments" element={<CreateAssessment />} />
        <Route path="/assessments/:id/edit" element={<CreateAssessment />} />
        <Route path="/rater/:assessmentId/:raterIndex" element={<RaterSurvey />} />
        <Route path="/assessments/:id" element={<AssessmentDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
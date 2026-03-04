import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AssessmentDetailsPage from "./pages/AssessmentDetailsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CreateAssessmentPage from "./pages/CreateAssessmentPage.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/:id"
        element={
          <ProtectedRoute>
            <AssessmentDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessments/new"
        element={
          <ProtectedRoute>
            <CreateAssessmentPage />
          </ProtectedRoute>
  }
/>


      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

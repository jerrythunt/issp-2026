import React from "react";
import { Navigate } from "react-router-dom";
import { mockApi } from "../services/mockApi.js";

export default function ProtectedRoute({ children }) {
  const token = mockApi.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

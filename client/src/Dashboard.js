import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "./firebase";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <button onClick={() => navigate("/create-questions")} style={{ marginTop: "10px" }}>
        Create Questions
      </button>
      <button onClick={() => navigate("/create-survey")} style={{ marginTop: "10px" }}>
        Create Survey
      </button>
      <button onClick={handleLogout}>Logout</button>

    </div>
  );
}

export default Dashboard;
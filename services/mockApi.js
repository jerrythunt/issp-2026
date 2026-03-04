// src/services/mockApi.js

const MOCK_USER = {
  name: "David",
  email: "david@leblancleadership.com",
};

let mockToken = localStorage.getItem("token") || null;

// NOTE: let (not const) so we can add new ones
let assessments = [
  {
    id: "a1",
    clientName: "John Fitzgerald III",
    clientEmail: "johnfitz@email.ca",
    dateSent: "2026-01-01",
    deadline: "2026-02-01",
    status: "IN_PROGRESS",
    completedCount: 6,
    totalCount: 12,
  },
  {
    id: "a2",
    clientName: "Sarah Nguyen",
    clientEmail: "sarah@email.ca",
    dateSent: "2026-01-20",
    deadline: "2026-02-05",
    status: "COMPLETED",
    completedCount: 15,
    totalCount: 15,
  },
  {
    id: "a3",
    clientName: "Michael Chen",
    clientEmail: "michael@email.ca",
    dateSent: "2026-02-02",
    deadline: "2026-02-20",
    status: "NOT_STARTED",
    completedCount: 0,
    totalCount: 10,
  },
];

// simulate network latency
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  /* ---------------- AUTH ---------------- */

  async login({ email, password }) {
    await sleep(300);

    if (!email || !password) {
      const err = new Error("Email and password are required.");
      err.status = 400;
      throw err;
    }

    mockToken = "mock-jwt-token";
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(MOCK_USER));

    return { token: mockToken, user: MOCK_USER };
  },

  logout() {
    mockToken = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  /* ---------------- ASSESSMENTS ---------------- */

  async getAssessments() {
    await sleep(250);

    if (!mockToken) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    return assessments;
  },

  async getAssessmentById(id) {
    await sleep(250);

    if (!mockToken) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    const a = assessments.find((x) => x.id === id);
    if (!a) {
      const err = new Error("Assessment not found");
      err.status = 404;
      throw err;
    }

    return {
      ...a,
      questionsCount: a.totalCount, // placeholder
      reportStatus: a.status === "COMPLETED" ? "READY" : "NOT_READY",
    };
  },

  async createAssessment({ clientName, clientEmail, deadline, raters }) {
    await sleep(300);

    if (!mockToken) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    if (
      !clientName?.trim() ||
      !clientEmail?.trim() ||
      !deadline ||
      !Array.isArray(raters) ||
      raters.length === 0
    ) {
      const err = new Error("Missing required fields");
      err.status = 400;
      throw err;
    }

    const id = `a${Math.random().toString(16).slice(2, 7)}`;

    const newAssessment = {
      id,
      clientName,
      clientEmail,
      dateSent: new Date().toISOString().slice(0, 10),
      deadline,
      status: "NOT_STARTED",
      completedCount: 0,
      totalCount: raters.length,
    };

    // add to top so it shows immediately
    assessments = [newAssessment, ...assessments];

    return newAssessment;
  },

  /* ---------------- REPORT ---------------- */

  async downloadReport(id) {
    await sleep(200);

    const content = `Assessment Report\n\nAssessment ID: ${id}\n\n(This is a placeholder PDF.)`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-${id}-report.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  },
};

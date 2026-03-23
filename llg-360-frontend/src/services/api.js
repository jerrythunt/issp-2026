export async function getQuestions() {
  const response = await fetch("/api/questions");

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  return response.json();
}

export async function createQuestion(text, type) {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, type }),
  });

  if (!response.ok) {
    throw new Error("Failed to create question");
  }

  return response.json();
}

export async function deleteQuestion(id) {
  const response = await fetch(`/api/questions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete question");
  }

  return response.json();
}

export async function getSurveys() {
  const response = await fetch("/api/surveys");

  if (!response.ok) {
    throw new Error("Failed to fetch surveys");
  }

  return response.json();
}

export async function createSurvey(name, questionIds) {
  const response = await fetch("/api/surveys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, questionIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to create survey");
  }

  return response.json();
}

export async function deleteSurvey(id) {
  const response = await fetch(`/api/surveys/${id}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete survey");
  }

  return data;
}

// --- Assessment Functions ---

export async function getAssessments() {
  const response = await fetch("/api/assessments");

  if (!response.ok) {
    throw new Error("Failed to fetch assessments");
  }

  return response.json();
}

export async function getAssessmentById(id) {
  const response = await fetch(`/api/assessments/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch assessment");
  }

  return response.json();
}

// New: Fetches assessment data + all associated responses
export async function getAssessmentDetails(id) {
  const response = await fetch(`/api/assessments/${id}/details`);

  if (!response.ok) {
    throw new Error("Failed to fetch assessment details");
  }

  return response.json();
}

export async function createAssessment(payload) {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create assessment");
  }

  return response.json();
}

export async function updateAssessment(id, payload) {
  const response = await fetch(`/api/assessments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to update assessment");
  }

  return data;
}

export async function deleteAssessment(id) {
  const response = await fetch(`/api/assessments/${id}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete assessment");
  }

  return data;
}

export async function markRaterSubmitted(assessmentId, raterIndex) {
  const response = await fetch(`/api/assessments/${assessmentId}/rater/${raterIndex}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to update rater");
  }

  return response.json();
}

export async function submitAssessmentResponses(assessmentId, payload) {
  const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit responses");
  }

  return data;
}

export async function getAssessmentResponses(id) {
  const response = await fetch(`/api/assessments/${id}/responses`);

  if (!response.ok) {
    throw new Error("Failed to fetch responses");
  }

  return response.json();
}

// --- Survey Helper ---

export async function getFullSurvey(id) {
  const response = await fetch(`/api/surveys/${id}/full`);

  if (!response.ok) {
    throw new Error("Failed to fetch survey");
  }

  return response.json();
}
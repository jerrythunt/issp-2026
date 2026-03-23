const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

// GET all assessments
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("assessments").get();

    const assessments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// GET one assessment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("assessments").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    res.json({
      id: snapshot.id,
      ...snapshot.data(),
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
});

// POST create assessment
router.post("/", async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      surveyId,
      surveyName,
      deadline,
      raters,
    } = req.body;

    if (
      !clientName ||
      !clientEmail ||
      !surveyId ||
      !surveyName ||
      !deadline ||
      !Array.isArray(raters) ||
      raters.length === 0
    ) {
      return res.status(400).json({
        error: "All fields are required, including at least one rater.",
      });
    }

    const assessment = {
      clientName,
      clientEmail,
      surveyId,
      surveyName,
      deadline,
      status: "Not Started",
      createdAt: new Date(),
      raters: raters.map((rater) => ({
        ...rater,
        submitted: false,
      })),
    };

    const docRef = await db.collection("assessments").add(assessment);

    res.status(201).json({
      id: docRef.id,
      ...assessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({ error: "Failed to create assessment" });
  }
});

// POST submit responses for one rater
router.post("/:id/submit", async (req, res) => {
  try {
    const { id } = req.params;
    const { raterIndex, answers } = req.body;

    if (
      Number.isNaN(Number(raterIndex)) ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        error: "raterIndex and answers are required",
      });
    }

    const docRef = db.collection("assessments").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const assessment = snapshot.data();
    const raters = assessment.raters || [];
    const index = Number(raterIndex);

    if (index < 0 || index >= raters.length) {
      return res.status(400).json({ error: "Invalid rater index" });
    }

    if (raters[index].submitted) {
      return res.status(400).json({ error: "This rater already submitted" });
    }

    await db.collection("responses").add({
      assessmentId: id,
      surveyId: assessment.surveyId,
      raterIndex: index,
      raterName: raters[index].name,
      clientName: assessment.clientName,
      answers,
      submittedAt: new Date(),
    });

    raters[index].submitted = true;
    await docRef.update({ raters });

    res.status(201).json({ message: "Responses submitted successfully" });
  } catch (error) {
    console.error("Error submitting responses:", error);
    res.status(500).json({ error: "Failed to submit responses" });
  }
});

// PATCH mark one rater as submitted (Admin manual override)
router.patch("/:id/rater/:index", async (req, res) => {
  try {
    const { id, index } = req.params;

    const docRef = db.collection("assessments").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const assessment = snapshot.data();
    const raters = assessment.raters || [];
    const raterIndex = Number(index);

    if (Number.isNaN(raterIndex) || raterIndex < 0 || raterIndex >= raters.length) {
      return res.status(400).json({ error: "Invalid rater index" });
    }

    raters[raterIndex].submitted = true;

    await docRef.update({ raters });

    res.json({ message: "Rater marked as submitted" });
  } catch (error) {
    console.error("Error updating rater submission:", error);
    res.status(500).json({ error: "Failed to update rater submission" });
  }
});

// GET responses for one assessment
router.get("/:id/responses", async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db
      .collection("responses")
      .where("assessmentId", "==", id)
      .get();

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// PUT update one assessment
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      clientEmail,
      surveyId,
      surveyName,
      deadline,
      raters,
    } = req.body;

    if (
      !clientName ||
      !clientEmail ||
      !surveyId ||
      !surveyName ||
      !deadline ||
      !Array.isArray(raters) ||
      raters.length === 0
    ) {
      return res.status(400).json({
        error: "All fields are required, including at least one rater.",
      });
    }

    const docRef = db.collection("assessments").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const existingAssessment = snapshot.data();
    const existingRaters = existingAssessment.raters || [];

    const updatedRaters = raters.map((rater) => {
      const matched = existingRaters.find(
        (oldRater) =>
          oldRater.name === rater.name &&
          oldRater.email === rater.email &&
          oldRater.relationship === rater.relationship
      );

      return {
        ...rater,
        submitted: matched ? matched.submitted : false,
      };
    });

    const updatedAssessment = {
      clientName,
      clientEmail,
      surveyId,
      surveyName,
      deadline,
      raters: updatedRaters,
    };

    await docRef.update(updatedAssessment);

    res.json({
      id,
      ...updatedAssessment,
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ error: "Failed to update assessment" });
  }
});

// DELETE one assessment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("assessments").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    await docRef.delete();

    res.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ error: "Failed to delete assessment" });
  }
});

// GET one assessment with all its responses
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    const assessmentRef = db.collection("assessments").doc(id);
    const assessmentSnap = await assessmentRef.get();

    if (!assessmentSnap.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const responsesSnap = await db
      .collection("responses")
      .where("assessmentId", "==", id)
      .get();

    const responses = responsesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      id: assessmentSnap.id,
      ...assessmentSnap.data(),
      responses,
    });
  } catch (error) {
    console.error("Error fetching assessment details:", error);
    res.status(500).json({ error: "Failed to fetch assessment details" });
  }
});

module.exports = router;
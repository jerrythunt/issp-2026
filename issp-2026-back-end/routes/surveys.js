const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

// GET all surveys
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("surveys").get();

    const surveys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// POST create a survey
router.post("/", async (req, res) => {
  try {
    const { name, questionIds } = req.body;

    if (!name || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        error: "name and at least one questionId are required",
      });
    }

    const docRef = await db.collection("surveys").add({
      name,
      questionIds,
      createdAt: new Date(),
    });

    res.status(201).json({
      id: docRef.id,
      name,
      questionIds,
    });
  } catch (error) {
    console.error("Error creating survey:", error);
    res.status(500).json({ error: "Failed to create survey" });
  }
});

// GET one survey with full question details
router.get("/:id/full", async (req, res) => {
  try {
    const { id } = req.params;

    const surveyRef = db.collection("surveys").doc(id);
    const surveySnap = await surveyRef.get();

    if (!surveySnap.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const survey = surveySnap.data();
    const questionIds = survey.questionIds || [];

    const questionDocs = await Promise.all(
      questionIds.map((questionId) =>
        db.collection("questions").doc(questionId).get()
      )
    );

    const questions = questionDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    res.json({
      id: surveySnap.id,
      ...survey,
      questions,
    });
  } catch (error) {
    console.error("Error fetching full survey:", error);
    res.status(500).json({ error: "Failed to fetch full survey" });
  }
});

// DELETE one survey (added with dependency check)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const surveyRef = db.collection("surveys").doc(id);
    const surveySnap = await surveyRef.get();

    if (!surveySnap.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Check if any assessments are currently using this surveyId
    const assessmentsUsingSurvey = await db
      .collection("assessments")
      .where("surveyId", "==", id)
      .get();

    if (!assessmentsUsingSurvey.empty) {
      return res.status(400).json({
        error: "Cannot delete survey because it is being used by one or more assessments.",
      });
    }

    await surveyRef.delete();

    res.json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    res.status(500).json({ error: "Failed to delete survey" });
  }
});

module.exports = router;
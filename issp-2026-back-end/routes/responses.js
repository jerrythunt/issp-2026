const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

// POST submit responses for one rater
router.post("/", async (req, res) => {
  try {
    const {
      assessmentId,
      surveyId,
      surveyName,
      clientName,
      raterIndex,
      raterName,
      raterEmail,
      relationship,
      answers,
    } = req.body;

    if (
      !assessmentId ||
      !surveyId ||
      !clientName ||
      raterIndex === undefined ||
      !raterName ||
      !Array.isArray(answers)
    ) {
      return res.status(400).json({ error: "Missing required response fields" });
    }

    // save response document
    const responseDoc = {
      assessmentId,
      surveyId,
      surveyName: surveyName || "",
      clientName,
      raterIndex,
      raterName,
      raterEmail: raterEmail || "",
      relationship: relationship || "",
      answers,
      submittedAt: new Date(),
    };

    await db.collection("responses").add(responseDoc);

    // mark the rater as submitted on the assessment
    const assessmentRef = db.collection("assessments").doc(assessmentId);
    const snapshot = await assessmentRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const assessment = snapshot.data();
    const raters = assessment.raters || [];

    if (raterIndex < 0 || raterIndex >= raters.length) {
      return res.status(400).json({ error: "Invalid rater index" });
    }

    raters[raterIndex].submitted = true;

    await assessmentRef.update({ raters });

    res.status(201).json({ message: "Responses submitted successfully" });
  } catch (error) {
    console.error("Error submitting responses:", error);
    res.status(500).json({ error: "Failed to submit responses" });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { db } = require("../config/firebaseAdmin");

// GET all questions
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("questions").get();

    const questions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// POST a new question
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/questions hit");
    console.log("Request body:", req.body);

    const { text, type } = req.body;

    if (!text || !type) {
      return res.status(400).json({ error: "text and type are required" });
    }

    const docRef = await db.collection("questions").add({
      text,
      type,
      createdAt: new Date(),
    });

    console.log("Question created with ID:", docRef.id);

    res.status(201).json({
      id: docRef.id,
      text,
      type,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// DELETE a question
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("questions").doc(id).delete();

    res.json({ message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

module.exports = router;
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const questionsRouter = require("./routes/questions");
const surveysRouter = require("./routes/surveys");
const assessmentsRouter = require("./routes/assessments");
const responsesRouter = require("./routes/responses");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/questions", questionsRouter);
app.use("/api/surveys", surveysRouter);
app.use("/api/assessments", assessmentsRouter);
app.use("/api/responses", responsesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
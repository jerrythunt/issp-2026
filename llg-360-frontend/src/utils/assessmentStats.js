/**
 * 1. UPDATED LOGIC (Keep old name so UI doesn't break)
 * This handles the numeric/average calculations for scaled questions.
 */
export function calculateScaledQuestionAverages(responses) {
  const grouped = {};

  responses.forEach((response) => {
    (response.answers || []).forEach((answer) => {
      // Only process "scaled" types with valid numbers
      if (answer.type !== "scaled" || !answer.answer) return;

      const numeric = Number(answer.answer);
      if (Number.isNaN(numeric)) return;

      if (!grouped[answer.questionText]) {
        grouped[answer.questionText] = [];
      }
      grouped[answer.questionText].push(numeric);
    });
  });

  return Object.entries(grouped).map(([questionText, values]) => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return {
      questionText,
      average: Number(average.toFixed(2)),
      responsesCount: values.length,
    };
  });
}

/**
 * 2. NEW FUNCTION (Added to the file)
 * This allows you to show open-ended comments in your reports.
 */
export function getTextResponsesFromResponses(responses) {
  const grouped = {};

  responses.forEach((response) => {
    const raterName = response.raterName || "Unknown Rater";

    (response.answers || []).forEach((answer) => {
      if (answer.type !== "text" || !answer.answer?.trim()) return;

      if (!grouped[answer.questionText]) {
        grouped[answer.questionText] = [];
      }

      grouped[answer.questionText].push({
        raterName,
        answer: answer.answer,
      });
    });
  });

  return grouped;
}

// 3. ALIAS (Optional: so both names work)
export const getScaledAveragesFromResponses = calculateScaledQuestionAverages;
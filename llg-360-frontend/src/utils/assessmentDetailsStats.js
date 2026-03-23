export function getScaledAveragesFromResponses(responses) {
  const grouped = {};

  responses.forEach((response) => {
    (response.answers || []).forEach((answer) => {
      if (answer.type !== "scaled") return;
      if (!answer.answer) return;

      const numeric = Number(answer.answer);
      if (Number.isNaN(numeric)) return;

      if (!grouped[answer.questionText]) {
        grouped[answer.questionText] = [];
      }

      grouped[answer.questionText].push(numeric);
    });
  });

  return Object.entries(grouped).map(([questionText, values]) => {
    const average =
      values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      questionText,
      average: Number(average.toFixed(2)),
      responsesCount: values.length,
    };
  });
}

export function getTextResponsesFromResponses(responses) {
  const grouped = {};

  responses.forEach((response) => {
    const raterName = response.raterName || "Unknown Rater";

    (response.answers || []).forEach((answer) => {
      if (answer.type !== "text") return;
      if (!answer.answer || !answer.answer.trim()) return;

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
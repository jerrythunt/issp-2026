export function getScaledAveragesFromResponses(responses) {
  const grouped = {};

  responses.forEach((response) => {
    if (response.isSelf) return;

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

export function getSelfScaledScores(responses) {
  const selfResponse = responses.find((response) => response.isSelf);

  if (!selfResponse) return [];

  return (selfResponse.answers || [])
    .filter((answer) => answer.type === "scaled" && answer.answer)
    .map((answer) => ({
      questionText: answer.questionText,
      selfScore: Number(answer.answer),
    }));
}

export function getTextResponsesFromResponses(responses) {
  const grouped = {};

  responses.forEach((response) => {
    if (response.isSelf) return;

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
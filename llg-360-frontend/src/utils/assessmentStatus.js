export function getAssessmentProgress(assessment) {

  const raters = assessment.raters || [];

  const total = raters.length;

  const submitted = raters.filter((rater) => rater.submitted).length;



  if (total === 0) {

    return {

      label: "No Raters",

      submitted: 0,

      total: 0,

      state: "none",

    };

  }



  if (submitted === 0) {

    return {

      label: "Not Started",

      submitted,

      total,

      state: "not-started",

    };

  }



  if (submitted === total) {

    return {

      label: "Completed",

      submitted,

      total,

      state: "completed",

    };

  }



  return {

    label: `${submitted}/${total} Responses`,

    submitted,

    total,

    state: "in-progress",

  };

}
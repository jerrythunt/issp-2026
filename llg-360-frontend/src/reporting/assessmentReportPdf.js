import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import clarityHeaderLogo from "../assets/report/clarityindex.png";
import newLogo from "../assets/report/newlogo.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
  Legend,
);

const roleOrder = ["Self", "Peers", "DirectReports", "Leader", "IndirectReports"];

const roleColor = {
  Self: "#0047AB",
  Peers: "#40E0D0",
  DirectReports: "#1b7c00",
  Leader: "#838383",
  IndirectReports: "#ffb300",
};

const ratingLabels = ["1", "2", "3", "4", "5", "N/O"];
const ratingColors = ["#4472C4", "#ED7D31", "#70AD47", "#00B0F0", "#9E4EBD", "#A9D18E"];

const pageWidth = 210;
const margin = 25.4;
const spacing = 5;
const regularFont = 9;
const headerFont = 11;
const lineHeight = 1.15;
const blankLine = 4.2333333333333325 * lineHeight;
const maxTextWidth = pageWidth - margin * 2;
const maxIndentTextWidth = pageWidth - margin * 3;
const headerLogoHeight = 9;
const headerLogoWidth = 42;

function mean(values) {
  if (!values.length) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function formatDate(dateValue) {
  if (!dateValue) return "";

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeRelationship(relationship, isSelf = false) {
  if (isSelf) return "Self";

  const value = String(relationship || "").toLowerCase();

  if (value.includes("self")) return "Self";
  if (value.includes("peer") || value.includes("colleague") || value.includes("cowork")) return "Peers";
  if (value.includes("indirect report")) return "IndirectReports";
  if (value.includes("direct report")) return "DirectReports";
  if (value.includes("leader") || value.includes("manager") || value.includes("supervisor") || value.includes("boss")) return "Leader";
  if (value.includes("report")) return "DirectReports";

  return "Other";
}

function getAnswerValue(answer) {
  if (!answer) return "";

  if (Object.prototype.hasOwnProperty.call(answer, "answer")) return answer.answer;
  if (Object.prototype.hasOwnProperty.call(answer, "value")) return answer.value;
  return "";
}

function getQuestionText(answer, fallbackQuestion) {
  return answer?.questionText || fallbackQuestion?.text || fallbackQuestion?.questionText || "Untitled question";
}

function getQuestionType(answer, fallbackQuestion) {
  return answer?.type || fallbackQuestion?.type || "text";
}

function collectQuestionMap(assessment, survey) {
  const questionMap = new Map();

  for (const question of survey?.questions || []) {
    questionMap.set(question.id, question);
  }

  for (const response of assessment?.responses || []) {
    for (const answer of response.answers || []) {
      const key = answer.questionId || answer.questionText;
      if (!key) continue;

      if (!questionMap.has(key)) {
        questionMap.set(key, {
          id: key,
          text: answer.questionText || String(key),
          type: answer.type || "text",
        });
      }
    }
  }

  return Array.from(questionMap.values());
}

function buildReportData(assessment, survey) {
  const questions = collectQuestionMap(assessment, survey);
  const responses = assessment?.responses || [];

  const scaledQuestions = questions.filter((question) => question.type === "scaled");
  const narrativeQuestions = questions.filter((question) => question.type === "text");

  const scaledSummaries = scaledQuestions.map((question) => {
    const byRole = {
      Self: [],
      Peers: [],
      DirectReports: [],
      Leader: [],
      IndirectReports: [],
      Other: [],
    };

    const distribution = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "N/O": 0,
    };

    for (const response of responses) {
      const rater = assessment?.raters?.[Number(response?.raterIndex)] || {};
      const relationship = response?.relationship || rater.relationship || "";
      const isSelf = response?.isSelf || Number(response?.raterIndex) === 0 || normalizeRelationship(relationship, false) === "Self";
      const category = normalizeRelationship(relationship, isSelf);

      for (const answer of response.answers || []) {
        if (getQuestionText(answer, question) !== question.text) continue;
        if (getQuestionType(answer, question) !== "scaled") continue;

        const rawValue = getAnswerValue(answer);
        const normalizedValue = String(rawValue).trim().toUpperCase();

        if (normalizedValue === "N/O" || normalizedValue === "NO" || normalizedValue === "NOT OBSERVED") {
          distribution["N/O"] += 1;
          continue;
        }

        const numericValue = Number(normalizedValue);
        if (Number.isNaN(numericValue)) continue;

        distribution[String(numericValue)] += 1;

        if (!byRole[category]) {
          byRole.Other.push(numericValue);
          continue;
        }

        byRole[category].push(numericValue);
      }
    }

    const selfScore = mean(byRole.Self);
    const raterValues = roleOrder
      .filter((role) => role !== "Self")
      .flatMap((role) => byRole[role]);
    const raterScore = mean(raterValues);

    return {
      questionText: question.text,
      selfScore,
      raterScore,
      distribution,
      byRole,
    };
  });

  const overview = {
    Self: mean(scaledSummaries.map((summary) => summary.selfScore).filter((value) => value > 0)),
    Raters: mean(scaledSummaries.map((summary) => summary.raterScore).filter((value) => value > 0)),
  };

  const heatmapRows = scaledSummaries.map((summary) => {
    const selfScore = summary.selfScore || 0;
    const peerScore = summary.byRole.Peers.length ? mean(summary.byRole.Peers) - selfScore : null;
    const directReportScore = summary.byRole.DirectReports.length ? mean(summary.byRole.DirectReports) - selfScore : null;
    const leaderScore = summary.byRole.Leader.length ? mean(summary.byRole.Leader) - selfScore : null;
    const indirectReportScore = summary.byRole.IndirectReports.length ? mean(summary.byRole.IndirectReports) - selfScore : null;

    return [selfScore, directReportScore, peerScore, leaderScore, indirectReportScore];
  });

  const narrativeSections = narrativeQuestions.map((question) => {
    const comments = [];

    for (const response of responses) {
      const rater = assessment?.raters?.[Number(response?.raterIndex)] || {};
      const raterName = response?.raterName || rater.name || "Unknown Rater";

      for (const answer of response.answers || []) {
        if (getQuestionText(answer, question) !== question.text) continue;
        if (getQuestionType(answer, question) !== "text") continue;

        const text = String(getAnswerValue(answer) || "").trim();
        if (!text) continue;

        comments.push({
          answer: text,
        });
      }
    }

    return {
      question: question.text,
      responses: comments,
    };
  });

  return {
    assessment,
    survey,
    questions,
    scaledQuestions,
    narrativeQuestions,
    scaledSummaries,
    overview,
    heatmapRows,
    narrativeSections,
    reportDate: formatDate(assessment?.deadline || new Date()),
    clientName: assessment?.clientName || "Assessment Report",
    surveyName: assessment?.surveyName || survey?.name || "Survey",
    totalResponses: responses.length,
  };
}

function getContentBottomY(pdf) {
  return pdf.internal.pageSize.getHeight() - margin;
}

function writeWrappedLinesWithPaging(pdf, lines, x, yPos) {
  const linePixelHeight = pdf.getTextDimensions("filler").h * lineHeight;

  if (!Array.isArray(lines) || lines.length === 0) {
    return yPos + blankLine;
  }

  let index = 0;
  while (index < lines.length) {
    const availableHeight = getContentBottomY(pdf) - yPos;
    let linesThatFit = Math.floor(availableHeight / linePixelHeight);

    if (linesThatFit <= 0) {
      pdf.addPage();
      yPos = margin;
      continue;
    }

    linesThatFit = Math.min(linesThatFit, lines.length - index);
    const chunk = lines.slice(index, index + linesThatFit);
    pdf.text(chunk, x, yPos);
    yPos += linePixelHeight * linesThatFit;
    index += linesThatFit;

    if (index < lines.length) {
      pdf.addPage();
      yPos = margin;
    }
  }

  return yPos + blankLine;
}

function addHeader(pdf, text, yPos) {
  pdf.setFontSize(headerFont);
  pdf.setTextColor("#000");
  pdf.setFont("helvetica", "bold");
  const lines = pdf.splitTextToSize(text, maxTextWidth);
  return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addSubheader(pdf, text, yPos) {
  pdf.setFontSize(headerFont);
  pdf.setTextColor("#000");
  pdf.setFont("helvetica", "bold");
  const lines = pdf.splitTextToSize(text, maxTextWidth);
  return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addBody(pdf, text, yPos) {
  pdf.setFontSize(regularFont);
  pdf.setTextColor("#000");
  pdf.setFont("helvetica", "normal");
  const lines = pdf.splitTextToSize(text, maxTextWidth);
  return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addIndentBody(pdf, text, yPos) {
  yPos -= blankLine / 2;
  pdf.setFontSize(regularFont);
  pdf.setTextColor("#000");
  pdf.setFont("helvetica", "normal");
  const lines = [];
  const breakSplit = String(text).split("\n");

  for (const segment of breakSplit) {
    const widthSplit = pdf.splitTextToSize(segment, maxIndentTextWidth);

    for (let index = 0; index < widthSplit.length; index += 1) {
      widthSplit[index] = index === 0 ? `\u2022 ${widthSplit[index]}` : `  ${widthSplit[index]}`;
      lines.push(widthSplit[index]);
    }
  }

  return writeWrappedLinesWithPaging(pdf, lines, margin * 1.4, yPos);
}

function addTemplate(pdf, pageNum) {
  pdf.setFontSize(headerFont);
  pdf.setTextColor("#000");
  pdf.setFont("helvetica", "bold");
  pdf.text(pageNum, margin / 2, margin / 2);
  pdf.addImage(clarityHeaderLogo, "PNG", pageWidth / 2 - headerLogoWidth / 2, margin * 0.35, headerLogoWidth, headerLogoHeight);
}

function addContent(pdf, header, yPos, page, indent) {
  pdf.setTextColor("#000");

  const startX = margin + indent;
  const pageX = pageWidth - margin;
  const pageText = String(page);
  const gapToPage = spacing * 2;

  pdf.setFontSize(11);
  const pageTextWidth = pdf.getTextWidth(pageText);
  const availableWidth = Math.max(20, pageX - pageTextWidth - gapToPage - startX);

  pdf.setFont("helvetica", "bold");
  const lines = pdf.splitTextToSize(header, availableWidth);
  pdf.text(lines, startX, yPos);

  pdf.setFont("helvetica", "bold");
  pdf.text(pageText, pageX, yPos, { align: "right" });

  return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + blankLine * 0.6;
}

function addCoverPage(pdf, reportData) {
  const centerX = pageWidth / 2;
  const subtitle = "A focused 360 for leadership clarity and impact";
  const intro = "The Clarity Index is a developmental feedback tool designed to support leadership self-awareness, insight, and focused growth conversations. It is not intended for performance management, compensation decisions, or disciplinary action.";
  const tagline = "Clarity creates choice. Choice creates growth.";

  pdf.addImage(clarityHeaderLogo, "PNG", centerX - 52, 24, 104, 38);

  pdf.setFont("times", "italic");
  pdf.setFontSize(10.5);
  pdf.text(subtitle, centerX, 71, { align: "center" });

  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(margin, 79, pageWidth - margin, 79);

  pdf.setFont("times", "normal");
  pdf.setFontSize(9.5);
  const introLines = pdf.splitTextToSize(intro, pageWidth - margin * 2 - 10);
  pdf.text(introLines, centerX, 86, { align: "center" });

  pdf.line(margin, 112, pageWidth - margin, 112);
  pdf.line(centerX - 18, 120, centerX + 18, 120);

  pdf.setFont("times", "bold");
  pdf.setFontSize(16);
  pdf.text(reportData.clientName, centerX, 132, { align: "center" });

  pdf.setFont("times", "normal");
  pdf.setFontSize(11);
  pdf.text(reportData.reportDate, centerX, 141, { align: "center" });

  pdf.line(centerX - 16, 148, centerX + 16, 148);
  pdf.line(margin, 154, pageWidth - margin, 154);
  pdf.line(centerX - 16, 160, centerX + 16, 160);

  pdf.addImage(newLogo, "PNG", centerX - 20, 168, 40, 40);
  pdf.text(".", centerX, 212, { align: "center" });

  pdf.setFont("times", "bolditalic");
  pdf.setFontSize(10.5);
  pdf.text(tagline, centerX, 220, { align: "center" });
}

function addIntroPages(pdf) {
  let yPos = 0;

  yPos = addHeader(pdf, "Introduction to Your Clarity Index 360™ Report", margin);
  yPos = addSubheader(pdf, "Purpose of the Clarity Index 360™", yPos);
  yPos = addBody(pdf, "The Clarity Index 360™ is a facilitated, developmental leadership insight tool designed to help leaders understand how their leadership behaviours are experienced, perceived, and felt by others at work.", yPos);
  yPos = addBody(pdf, "Rather than measuring everything at once, the Clarity Index 360 intentionally focuses on a small number of priority behaviours that matter most for effectiveness, relationships, and impact right now. The goal is not perfection, comparison, or judgment, it is clarity: clarity about what is working well, where leadership impact is strongest, and where focused attention or refinement may be useful.", yPos);

  yPos = addSubheader(pdf, "How the Clarity Index 360 Is Designed", yPos);
  yPos = addBody(pdf, "The Clarity Index 360 differs from traditional 360-degree feedback tools in several important ways:", yPos);
  yPos = addIndentBody(pdf, "It is focused and bespoke, rather than broad or competency heavy.\nIt is administered and facilitated by The LIVE. LEARN. GROW. Company, a division of LeBlanc Leadership Group Inc.\nIt prioritizes insight over volume, collecting only data that will be used.\nIt is never delivered without facilitation, ensuring context, care, and meaning.\nIt treats feedback as developmental input, not evaluative judgment.", yPos);
  yPos = addBody(pdf, "Each Clarity Index 360 is customized based on the leader's role, context, goals, and coaching focus. Questions are drawn from a curated menu of behavioural statements and open-ended prompts, with a maximum of:", yPos);
  yPos = addIndentBody(pdf, "Approximately 10 rating questions, and\n3-5 narrative questions", yPos);
  addBody(pdf, "All raters are asked to respond based on direct observation of behaviour, not intent, personality, or assumptions. There are no right or wrong answers - honest, thoughtful input helps surface patterns that support reflection, learning, and constructive conversation.", yPos);

  pdf.addPage();

  yPos = addSubheader(pdf, "How to Read the Ratings", margin);
  yPos = addBody(pdf, "The rating questions use a behaviourally anchored scale, defined as follows:", yPos);
  yPos = addBody(pdf, "1 - Rarely Demonstrated\nThis behaviour is rarely observed or is ineffective when it occurs. It may create confusion, misalignment, or require intervention.", yPos);
  yPos = addBody(pdf, "2 - Inconsistently Demonstrated\nThe behaviour shows up occasionally but lacks consistency or impact. Effectiveness may vary by situation, pressure, or audience.", yPos);
  yPos = addBody(pdf, "3 - Generally Demonstrated\nThe behaviour is regularly observed and generally effective. It meets expectations and contributes positively, with room to strengthen impact or consistency.", yPos);
  yPos = addBody(pdf, "4 - Consistently Demonstrated\nThe behaviour is clearly and consistently demonstrated and meets expectations. It positively influences others and supports strong individual or team outcomes.", yPos);
  yPos = addBody(pdf, "5 - Clear Strength / Role Model\nThis behaviour is a distinct strength. The leader models it for others and it meaningfully elevates team, system, or organizational effectiveness.", yPos);
  yPos = addBody(pdf, "N/O - Not Observed\nThe rater has not had sufficient opportunity to observe this behaviour and cannot rate it fairly", yPos);

  yPos = addSubheader(pdf, "Understanding Aggregation and Confidentiality", yPos);
  yPos = addBody(pdf, "The Clarity Index 360 is designed to protect psychological safety while preserving insight:", yPos);
  yPos = addIndentBody(pdf, "Self-ratings are shown transparently and included in overall averages.\nLeader and Leader's Leader ratings are shown transparently.\nOther rater categories are shown only when there are three or more raters in that category.\nCategories with fewer than three raters are included in the overall score but not shown separately.", yPos);
  yPos = addBody(pdf, "These rules ensure confidentiality while still allowing meaningful patterns to emerge.", yPos);

  yPos = addSubheader(pdf, "Narrative Comments and Thematic Insights", yPos);
  yPos = addBody(pdf, "In addition to numeric ratings, this report includes verbatim narrative comments. These comments are not attributed to individual raters and are presented to add context, nuance, and texture to the quantitative data.", yPos);
  yPos = addBody(pdf, "Where appropriate, themes may be synthesized to surface:", yPos);
  yPos = addIndentBody(pdf, "Strengths\nGrowth edges\nPatterns and tensions\nOpportunities for intentional development", yPos);
  yPos = addBody(pdf, "The intent is to support conversation, reflection, and action, not judgment.", yPos);

  yPos = addSubheader(pdf, "What This Assessment Is (and Is Not)", yPos);
  yPos = addBody(pdf, "The Clarity Index 360 is:", yPos);
  yPos = addIndentBody(pdf, "A tool for self-awareness and leadership growth\nInput for coaching and developmental dialogue\nA way to reduce noise and focus attention on what matters most", yPos);
  yPos = addBody(pdf, "The Clarity Index 360 is not used for:", yPos);
  yPos = addIndentBody(pdf, "Performance ratings\nCompensation or promotion decisions\nRanking leaders against one another\nDisciplinary or HR compliance purposes", yPos);
  yPos = addSubheader(pdf, "A Final Note", yPos);
  addBody(pdf, "The value of this report lies not in the numbers alone, but in the quality of reflection and conversation it enables. It is intended to be explored thoughtfully, with curiosity and care, as part of an ongoing leadership development journey.", yPos);
}

function addInterpretationPage(pdf) {
  let yPos = addHeader(pdf, "Interpreting Your Results", margin);
  yPos = addBody(pdf, "The pages that follow present multiple perspectives on how your leadership behaviours are experienced by others. Rather than focusing on individual scores or isolated data points, this report is best read by noticing patterns, alignment, and areas of difference across perspectives.", yPos);
  yPos = addBody(pdf, "No single score tells the full story. What matters most is how the information comes together to support reflection, insight, and meaningful conversation.", yPos);
  yPos = addBody(pdf, "This report is designed to be explored thoughtfully and, where possible, in dialogue with a coach or facilitator. Its purpose is not judgment or evaluation, but clarity about what is working well, where your leadership impact is strongest, and where focused attention may be useful.", yPos);
  addBody(pdf, "As you review the results, consider approaching them with curiosity rather than conclusion.", yPos);
}

function addResultsIntroductionPage(pdf) {
  let yPos = addHeader(pdf, "Results by Leadership Theme", margin);
  yPos = addBody(pdf, "The following sections draw on real assessment responses and organize them into the core report views: self versus rater averages, ratings distribution, ratings differentials, and narrative feedback. As you review this section, consider the following reflection questions:", yPos);
  addIndentBody(pdf, "What stands out to you most in these results?\nWhere do you notice alignment between your self-ratings and others' experience?\nWhere do you notice differences or variation across perspectives?\nWhat context, conditions, or expectations might influence how these behaviours are experienced?", yPos);
}

function buildChartImage(config, width, height) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "fixed";
    canvas.style.left = "-10000px";
    canvas.style.top = "0";
    document.body.appendChild(canvas);

    const chart = new ChartJS(canvas, {
      ...config,
      options: {
        responsive: false,
        animation: false,
        ...config.options,
      },
    });

    window.requestAnimationFrame(() => {
      const image = chart.toBase64Image("image/png", 2);
      chart.destroy();
      canvas.remove();
      resolve(image);
    });
  });
}

function heatColor(value, colIndex) {
  if (value === null || Number.isNaN(value)) return "#f3f4f6";
  if (colIndex === 0) return "#d0e8f5";

  const intensity = Math.min(Math.abs(value) / 2, 1);
  const light = Math.round(255 - intensity * 160);

  if (value < 0) return `rgb(${light}, ${Math.round(light * 0.9)}, 255)`;
  if (value > 0) return `rgb(${Math.round(light * 0.9)}, ${Math.min(255, light + 20)}, ${light})`;
  return "#ffffff";
}

function buildHeatmapMarkup(reportData) {
  const columnHeaders = ["Self Rating", "Direct Reports", "Peer", "Leader", "Indirect Reports"];

  const rows = reportData.scaledSummaries.map((summary, index) => {
    const selfScore = reportData.heatmapRows[index][0];
    const directScore = reportData.heatmapRows[index][1];
    const peerScore = reportData.heatmapRows[index][2];
    const leaderScore = reportData.heatmapRows[index][3];
    const indirectScore = reportData.heatmapRows[index][4];

    return `
      <tr>
        <td style="border:1px solid #ccc;padding:10px 12px;max-width:360px;font-weight:bold;vertical-align:top;line-height:1.35;">${summary.questionText}</td>
        ${[selfScore, directScore, peerScore, leaderScore, indirectScore]
          .map((value, columnIndex) => {
            const backgroundColor = heatColor(value, columnIndex);
            const displayValue = value === null || Number.isNaN(value) ? "-" : Number(value).toFixed(2);
            return `<td style="border:1px solid #ccc;padding:10px 12px;text-align:center;white-space:nowrap;background:${backgroundColor};color:#000;font-weight:600;">${displayValue}</td>`;
          })
          .join("")}
      </tr>`;
  }).join("");

  return `
    <table style="border-collapse:collapse;width:100%;font-size:32px;margin-top:24px;background:#fff;color:#000;table-layout:fixed;">
      <thead>
        <tr>
          <th style="border:1px solid #ccc;padding:10px 12px;color:#000;width:40%;"></th>
          ${columnHeaders.map((header) => `<th style="border:1px solid #ccc;padding:10px 12px;text-align:left;white-space:normal;line-height:1.2;color:#000;font-weight:700;">${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function buildHeatmapImage(reportData) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "1600px";
  container.style.background = "#ffffff";
  container.innerHTML = buildHeatmapMarkup(reportData);
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  container.remove();
  return {
    image: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

function makeScaleScatterChartConfig(summary) {
  return {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Self-Assessment",
          data: [{ x: summary.selfScore || 0, y: 0 }],
          backgroundColor: roleColor.Self,
          pointRadius: 16,
          pointHoverRadius: 16,
        },
        {
          label: "Average Rater Assessment",
          data: [{ x: summary.raterScore || 0, y: 0 }],
          backgroundColor: roleColor.DirectReports,
          pointRadius: 16,
          pointHoverRadius: 16,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 18,
            boxHeight: 18,
            font: { size: 32 },
          },
        },
        title: { display: false },
      },
      scales: {
        x: {
          type: "linear",
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            font: { size: 32 },
          },
          grid: {
            display: false,
          },
        },
        y: {
          display: false,
          min: -1,
          max: 1,
        },
      },
    },
  };
}

function makeDistributionChartConfig(reportData) {
  const labels = reportData.scaledSummaries.map((summary) => summary.questionText);

  return {
    type: "bar",
    data: {
      labels,
      datasets: ratingLabels.map((label, index) => ({
        label,
        data: reportData.scaledSummaries.map((summary) => summary.distribution[label]),
        backgroundColor: ratingColors[index],
      })),
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "rect",
            boxWidth: 16,
            boxHeight: 16,
            font: { size: 32 },
          },
        },
        title: {
          display: true,
          text: "RATINGS DISTRIBUTION",
          font: { size: 32, weight: "bold" },
        },
      },
      scales: {
        x: { stacked: true, display: false },
        y: {
          stacked: true,
          ticks: {
            autoSkip: false,
            font: { size: 32 },
            callback(value, index) {
              const label = labels[index] || String(value);
              return String(label).length > 56 ? `${String(label).slice(0, 56)}...` : label;
            },
          },
        },
      },
    },
  };
}

function createChartPage(pdf, image, imageWidth, imageHeight, question) {
  pdf.addPage();
  let yPos = addHeader(pdf, question, margin);
  yPos += blankLine;
  pdf.addImage(image, "PNG", (pageWidth - imageWidth) / 2, yPos, imageWidth, imageHeight);
}

function createNarrativeIntro(pdf) {
  pdf.addPage();
  let yPos = addHeader(pdf, "Narrative Feedback Introduction", margin);
  yPos = addSubheader(pdf, "Narrative Comments: Context and Nuance", yPos);
  yPos = addBody(pdf, "In addition to numeric ratings, raters were invited to provide open-ended comments. These narrative responses offer context, examples, and nuance that numbers alone cannot provide.\nThe comments that follow are:", yPos);
  yPos = addIndentBody(pdf, "presented verbatim\nnot attributed to individuals\norganized by question", yPos);
  yPos = addBody(pdf, "As you read them, resist the urge to tally or weigh individual comments. Instead, notice:", yPos);
  yPos = addIndentBody(pdf, "recurring themes or language\ncontrasts in perspective\nmoments of clarity or tension", yPos);
  addBody(pdf, "Resist the urge to focus only on the highest or lowest scores. The most useful insights often live in the patterns and gaps. These comments are intended to support reflection and conversation, not to assign intent or judgment.", yPos);
}

function createNarrativePage(pdf, question, responses) {
  pdf.addPage();
  let yPos = addHeader(pdf, question, margin);

  if (!responses.length) {
    addBody(pdf, "No written responses were provided for this question.", yPos);
    return;
  }

  const responseText = responses.map((response) => `${response.answer}`).join("\n\n");
  addBody(pdf, responseText, yPos);
}

function createConclusionPage(pdf) {
  pdf.addPage();
  let yPos = addHeader(pdf, "Integration and Forward Reflection", margin);
  yPos = addSubheader(pdf, "Making Meaning of the Results", yPos);
  yPos = addBody(pdf, "The Clarity Index 360 is not intended to provide answers, but to invite intentional reflection and choice.\nAs you integrate what you have noticed in this report, consider the following questions:", yPos);
  yPos = addIndentBody(pdf, "What feels most important to sit with after reviewing these results?\nWhich strengths do you want to protect or build on?\nWhat patterns, if left unexamined, might limit your impact?\nWhat conversations might these results invite, with your coach, your leader, or your team?\nWhere do you feel most ready to experiment or adjust your leadership approach?", yPos);
  yPos = addBody(pdf, "The value of this report lies not in the data itself, but in how it supports ongoing learning, growth, and leadership practice.", yPos);
  pdf.addImage(newLogo, "PNG", pageWidth / 2 - 30, yPos, 60, 60);
  pdf.setFont("times", "bolditalic");
  pdf.setFontSize(10.5);
  pdf.text("Clarity creates choice. Choice creates growth", pageWidth / 2, yPos + 60 + blankLine, { align: "center" });
}

function createToCPage(pdf, reportData, pageNumbers) {
  let yPos = addHeader(pdf, "Table of Contents", margin);
  yPos = addContent(pdf, "INTRODUCTION TO YOUR CLARITY INDEX 360 REPORT", yPos, pageNumbers.intro, 0);
  yPos = addContent(pdf, "Purpose of the Clarity Index 360", yPos, pageNumbers.intro, spacing);
  yPos = addContent(pdf, "How the Clarity Index 360 Is Designed", yPos, pageNumbers.intro, spacing);
  yPos = addContent(pdf, "INTERPRETING YOUR RESULTS", yPos, pageNumbers.interpretation, 0);
  yPos = addContent(pdf, "Results by Leadership Theme", yPos, pageNumbers.results, 0);
  for (let index = 0; index < reportData.scaledSummaries.length; index += 1) {
    const summary = reportData.scaledSummaries[index];
    const heading = `On a Scale of (1-5), ${summary.questionText}`;
    yPos = addContent(pdf, heading, yPos, pageNumbers.scaleStart + index, 0);
  }
  yPos = addContent(pdf, "Ratings Distribution", yPos, pageNumbers.distribution, 0);
  yPos = addContent(pdf, "Ratings Differentials", yPos, pageNumbers.heatmap, 0);
  yPos = addContent(pdf, "Narrative Feedback Introduction", yPos, pageNumbers.narrativeIntro, 0);

  for (let index = 0; index < reportData.narrativeSections.length; index += 1) {
    const section = reportData.narrativeSections[index];
    yPos = addContent(pdf, section.question, yPos, pageNumbers.narrativeStart + index, spacing);
  }

  addContent(pdf, "Integration and Forward Reflection", yPos, pageNumbers.conclusion, 0);
}

export async function generateAssessmentReportPdf({ assessment, survey }) {
  const reportData = buildReportData(assessment, survey);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    lineHeight,
  });

  const scaledPageCount = reportData.scaledSummaries.length;

  const pageNumbers = {
    intro: 3,
    interpretation: 5,
    results: 6,
    scaleStart: 7,
    distribution: 7 + scaledPageCount,
    heatmap: 8 + scaledPageCount,
    narrativeIntro: 9 + scaledPageCount,
    narrativeStart: 10 + scaledPageCount,
    conclusion: 10 + scaledPageCount + reportData.narrativeSections.length,
  };

  addCoverPage(pdf, reportData);
  pdf.addPage();
  pdf.addPage();
  addIntroPages(pdf);
  pdf.addPage();
  addInterpretationPage(pdf);
  pdf.addPage();
  addResultsIntroductionPage(pdf);

  for (const summary of reportData.scaledSummaries) {
    const scaleQuestionTitle = `On a Scale of (1-5), ${summary.questionText}`;
    const scaleScatterChart = await buildChartImage(
      makeScaleScatterChartConfig(summary),
      1600,
      520,
    );

    createChartPage(pdf, scaleScatterChart, pageWidth - margin * 2, 85, scaleQuestionTitle);
  }

  const distributionChartHeight = Math.max(110, reportData.scaledSummaries.length * 14);
  const distributionChart = await buildChartImage(
    makeDistributionChartConfig(reportData),
    1600,
    Math.max(700, distributionChartHeight * 7),
  );
  createChartPage(pdf, distributionChart, pageWidth - margin * 2, distributionChartHeight, "Ratings Distribution");

  const heatmapImage = await buildHeatmapImage(reportData);
  const heatmapImageWidth = pageWidth - margin * 2;
  const heatmapImageHeight = (heatmapImage.height / heatmapImage.width) * heatmapImageWidth;
  createChartPage(pdf, heatmapImage.image, heatmapImageWidth, heatmapImageHeight, "Ratings Differentials");

  createNarrativeIntro(pdf);
  for (const section of reportData.narrativeSections) {
    createNarrativePage(pdf, section.question, section.responses);
  }
  createConclusionPage(pdf);

  for (let pageIndex = 2; pageIndex <= pdf.getNumberOfPages(); pageIndex += 1) {
    pdf.setPage(pageIndex);

    if (pageIndex === 2) {
      createToCPage(pdf, reportData, pageNumbers);
    }

    addTemplate(pdf, String(pageIndex));
  }

  const safeClientName = String(reportData.clientName || "assessment_report").replace(/[^a-z0-9]/gi, "_");
  pdf.save(`${safeClientName}_assessment_report.pdf`);
}

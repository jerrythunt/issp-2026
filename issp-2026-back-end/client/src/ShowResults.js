import { useRef, forwardRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ScatterController,
    PointElement,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import jsPDF from "jspdf";
import clarityHeaderLogo from "./images/clarityindex.png";
import newLogo from "./images/newlogo.png";
import html2canvas from "html2canvas";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ScatterController,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

function mean(arr) {
    let sum = 0;
    for (let v of arr) {
        sum += v;
    }

    return Number((sum / arr.length).toFixed(2));
}

const roleColor = {
    Self: "#0047AB",
    Peers: "#40E0D0",
    DirectReports: "#1b7c00",
    Leader: "#838383",
    Raters: "#ffb300"
}

const scaleResponses = [{
    question: "On a scale of 1-10 (1=low, 10=high), how effective is this leader in their overall leadership role?",
    Self: [8],
    Raters: [7, 8, 8, 7, 9]
}, {
    question: "On a scale of 1-10 (1=low, 10=high), how would you rate this leader's communication skills?",
    Self: [6],
    Raters: [5, 6, 7, 6, 5]
}]

const ratingLabels = [
    "Rarely Demonstrated",
    "Inconsistently Demonstrated",
    "Generally Demonstrated",
    "Consistently Demonstrated",
    "Clear Strength",
    "Not Observed",
];

const ratingColors = [
    "#4472C4",
    "#ED7D31",
    "#70AD47",
    "#00B0F0",
    "#9E4EBD",
    "#A9D18E",
];



// Each inner array is [Rarely, Inconsistently, Generally, Consistently, Clear Strength, Not Observed] counts per question
const distributionResponses = {
    questions: [
        "How consistently does this leader role-model organizational values and make decisions that support customer (internal or external) experience?",
        "How effectively does this leader collaborate across teams, functions, and partnerships to achieve shared goals?",
        "How effectively does this leader tailor their communication to build understanding, trust, and alignment?",
        "How clearly and persuasively does this leader communicate vision, priorities, and strategic intent?",
        "How well does this leader demonstrate empathy, self-awareness, and emotional regulation in interactions?",
        "How effectively does this leader navigate difficult conversations and resolve conflict constructively?",
        "How well does this leader coach, develop, and empower others to grow?",
        "How effectively does this leader champion, communicate, and sustain change across the organization?",
        "How effectively does this leader set direction and ensure the team delivers on commitments and outcomes?",
        "To what extent does this leader make well-informed decisions that consider long-term impact?",
    ],
    counts: [
        [0, 0, 4, 5, 4, 0],
        [0, 1, 2, 7, 3, 0],
        [0, 1, 3, 6, 3, 0],
        [0, 1, 3, 4, 4, 1],
        [0, 1, 5, 0, 7, 0],
        [0, 1, 3, 7, 2, 0],
        [0, 0, 4, 5, 3, 1],
        [0, 2, 5, 4, 2, 0],
        [0, 2, 3, 7, 1, 0],
        [0, 2, 3, 5, 3, 0],
    ]
};

function parseDistributionResponse(data) {
    return {
        labels: data.questions,
        datasets: ratingLabels.map((label, i) => ({
            label,
            data: data.counts.map(row => row[i]),
            backgroundColor: ratingColors[i],
        })),
    };
}

const distributionOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
            labels: { usePointStyle: true, pointStyle: "rect" },
        },
        title: {
            display: true,
            text: "RATINGS DISTRIBUTION",
            font: { size: 16, weight: "bold" },
        },
        datalabels: {
            color: "#000",
            font: { size: 11 },
            formatter: (value) => value === 0 ? "" : value,
        },
    },
    scales: {
        x: { stacked: true, display: false },
        y: {
            stacked: true,
            afterFit: (scale) => { scale.width = 300; },
            ticks: {
                maxRotation: 0,
                autoSkip: false,
                callback: function (value) {
                    const label = this.getLabelForValue(value);
                    const maxChars = 40;
                    if (label.length <= maxChars) return label;
                    const words = label.split(" ");
                    const lines = [];
                    let current = "";
                    for (const word of words) {
                        if ((current + " " + word).trim().length > maxChars) {
                            lines.push(current.trim());
                            current = word;
                        } else {
                            current = (current + " " + word).trim();
                        }
                    }
                    if (current) lines.push(current.trim());
                    return lines;
                },
            },
        },
    },
};

const heatmapData = {
    questions: [
        "How consistently does this leader role-model organizational values and make decisions that support customer (internal or external) experience?",
        "How effectively does this leader collaborate across teams, functions, and partnerships to achieve shared goals?",
        "How effectively does this leader tailor their communication to build understanding, trust, and alignment?",
        "How clearly and persuasively does this leader communicate vision, priorities, and strategic intent?",
        "How well does this leader demonstrate empathy, self-awareness, and emotional regulation in interactions?",
        "How effectively does this leader navigate difficult conversations and resolve conflict constructively?",
        "How well does this leader coach, develop, and empower others to grow?",
        "How effectively does this leader champion, communicate, and sustain change across the organization?",
        "How effectively does this leader set direction and ensure the team delivers on commitments and outcomes?",
        "To what extent does this leader make well-informed decisions that consider long-term impact?",
    ],
    // Each row: [selfRating, directReports, peer, leader, indirectReports]
    rows: [
        [4.00, 0.00, -0.33, 1.00, 0.00],
        [4.00, 0.20, -0.67, 1.00, -0.25],
        [5.00, -0.80, -2.00, -1.00, -1.00],
        [4.00, -0.80, -1.33, 0.00, -1.00],
        [5.00, -0.60, -1.00, 0.00, -0.25],
        [4.00, -0.40, -0.67, 0.00, 0.25],
        [4.00, 0.00, 0.00, 0.00, -0.25],
        [4.00, -0.40, -1.00, 0.00, -0.50],
        [4.00, -0.60, -1.00, 1.00, -0.25],
        [4.00, 0.00, -1.33, 0.00, 0.00],
    ]
};

const heatmapColumns = ["Self Rating", "Direct Reports", "Peer", "Leader", "Indirect Reports"];

function heatColor(value, colIndex) {
    if (colIndex === 0) return "#d0e8f5";
    const intensity = Math.min(Math.abs(value) / 2, 1);
    const light = Math.round(255 - intensity * 160);
    if (value < 0) return `rgb(${light}, ${Math.round(light * 0.9)}, 255)`;
    if (value > 0) return `rgb(${Math.round(light * 0.9)}, ${light + 20}, ${light})`;
    return "#ffffff";
}

const HeatmapTable = forwardRef(function HeatmapTable({ data }, ref) {
    return (
        <table ref={ref} style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, marginTop: 20 }}>
            <thead>
                <tr>
                    <th style={{ border: "1px solid #ccc", padding: "6px 10px" }}></th>
                    {heatmapColumns.map((h, i) => (
                        <th key={i} style={{ border: "1px solid #ccc", padding: "6px 10px", textAlign: "left", whiteSpace: "nowrap" }}>
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.questions.map((question, qi) => (
                    <tr key={qi}>
                        <td style={{ border: "1px solid #ccc", padding: "6px 10px", maxWidth: 220, fontWeight: "bold" }}>
                            {question}
                        </td>
                        {data.rows[qi].map((val, vi) => (
                            <td key={vi} style={{
                                border: "1px solid #ccc",
                                padding: "6px 10px",
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                backgroundColor: heatColor(val, vi),
                            }}>
                                {val.toFixed(2)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

const responses = [{ // split by categories
    Self: { q1: [5], q2: [3], q3: [4] },
    Peers: { q1: [3, 3, 5, 5, 4], q2: [4, 4, 4, 3, 5], q3: [2, 2, 3, 3, 2] },
    DirectReports: { q1: [4, 4, 2], q2: [5, 5, 4], q3: [3, 3, 5] },
    Leader: { q1: [4], q2: [4], q3: [5] },
    Raters: { q1: [3, 3, 5, 5, 4, 4, 4, 2, 4], q2: [4, 4, 4, 3, 5, 5, 5, 4], q3: [2, 2, 3, 3, 2, 3, 3, 5, 5] }
}, {
    Self: { q1: [1], q2: [1], q3: [1] },
    Peers: { q1: [2, 2, 2, 2, 2], q2: [2, 2, 2, 2, 2], q3: [2, 2, 2, 2, 2] },
    DirectReports: { q1: [3, 3, 3], q2: [3, 3, 3], q3: [3, 3, 3] },
    Leader: { q1: [4], q2: [4], q3: [4] },
    Raters: { q1: [2, 2, 2, 2, 2, 3, 3, 3, 4], q2: [2, 2, 2, 2, 2, 3, 3, 3, 4], q3: [2, 2, 2, 2, 2, 3, 3, 3, 4] }
}]

const narrativeResponses = [
    {
        question: "What are this leader's top strengths that most positively influence their effectiveness?",
        responses: [
            "Jane is thoughtful, authentic, and steady. Her openness and calm approach build trust and psychological safety.",
            "She collaborates well, listens deeply, and empowers others through autonomy and thoughtful delegation.",
            "Raters consistently describe her as supportive, transparent, and values-driven."
        ]
    },
    {
        question: "Where has this leader made meaningful impact in the past year?",
        responses: [
            "Led through complex organizational priorities including bargaining and SIP initiatives.",
            "Strengthened HR's strategic credibility and alignment with enterprise priorities.",
            "Maintained people support and well-being focus during high-pressure periods."
        ]
    },
    {
        question: "What should this leader do more of, less of, and/or differently?",
        responses: [
            "Articulate a clearer long-term HR vision and future-focused strategy.",
            "Increase visible decisiveness and strengthen boundary-setting around team capacity.",
            "Broaden direct engagement across leader levels to reduce blind spots and improve alignment."
        ]
    },
    {
        question: "How does this leader contribute to building a positive culture, psychological safety, and strong team dynamics?",
        responses: [
            "Creates an environment where people feel seen, respected, and safe to contribute.",
            "Models calm, ethical, and empathetic leadership in difficult moments.",
            "Encourages collaboration and open dialogue across teams."
        ]
    },
    {
        question: "Any additional comments you would like to share?",
        responses: [
            "The leader is widely respected for strategic focus, authenticity, and commitment to people.",
            "Additional dedicated time for one-on-one connection could further strengthen cohesion and support."
        ]
    }
]

const margin = 25.4; // 1 inch
const spacing = 5;
const width = 210;
const regularFont = 9;
const headerFont = 11;
const lineHeight = 1.15;
const blankLine = 4.2333333333333325 * lineHeight;
const maxTextWidth = width - (margin * 2);
const maxIndentTextWidth = width - (margin * 3);
const today = new Date();

const headerLogoHeight = 9;
const headerLogoWidth = 42;

const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

function parseScaleResponse(response) {
    const selfScore = mean(response.Self);
    const raterScore = mean(response.Raters);
    return {
        question: response.question,
        datasets: [
            {
                label: "Self-Assessment",
                data: [{ x: selfScore, y: 0 }],
                backgroundColor: roleColor.Self,
                pointRadius: 14,
                pointHoverRadius: 14,
            },
            {
                label: "Average Rater Assessment",
                data: [{ x: raterScore, y: 0 }],
                backgroundColor: roleColor.DirectReports,
                pointRadius: 14,
                pointHoverRadius: 14,
            },
        ],
    };
}

const scatterOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                usePointStyle: true,
                pointStyle: "circle",
            },
        },
        tooltip: {
            callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x.toFixed(1)}`,
            },
        },
        title: { display: false },
    },
    scales: {
        x: {
            type: "linear",
            min: 1,
            max: 10,
            ticks: { stepSize: 1 },
            grid: { display: false },
        },
        y: {
            display: false,
            min: -1,
            max: 1,
        },
    },
};

let cats = [];
let descs = [];

function parseResponse(response) {
    let datasets = [];
    let labels = Object.keys(response["Self"]);
    for (let role in response) {
        if (role === "Peers" && response[role][labels[0]].length <= 2) continue;
        let data = [];
        for (let q of labels) {
            data.push(Number((mean(response[role][q])).toFixed(2)));
        }
        datasets.push({
            label: role,
            backgroundColor: roleColor[role],
            data: data
        });
    }
    return { datasets, labels };
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
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addSubheader(pdf, text, yPos) {
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "normal");
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addBody(pdf, text, yPos) {
    pdf.setFontSize(regularFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "normal");
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    return writeWrappedLinesWithPaging(pdf, lines, margin, yPos);
}

function addTemplate(pdf, pageNum) {
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "bold");
    pdf.text(pageNum, margin / 2, margin / 2);
    pdf.addImage(clarityHeaderLogo, "PNG", width / 2 - headerLogoWidth / 2, margin * 0.35, headerLogoWidth, headerLogoHeight);
}

function addIndentBody(pdf, text, yPos) {
    yPos -= blankLine / 2;
    pdf.setFontSize(regularFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "normal");
    let lines = []
    let breakSplit = text.split("\n");
    for (let i = 0; i < breakSplit.length; i++) {
        let widthSplit = pdf.splitTextToSize(breakSplit[i], maxIndentTextWidth);
        for (let j = 0; j < widthSplit.length; j++) {
            if (j === 0) {
                widthSplit[j] = "\u2022 " + widthSplit[j];
            } else {
                widthSplit[j] = "  " + widthSplit[j];
            }
            lines.push(widthSplit[j]);
        }
    }
    return writeWrappedLinesWithPaging(pdf, lines, margin * 1.4, yPos);
}

function createContextPages(pdf, name) {
    let yPos = 0;

    // Page 1
    const centerX = width / 2;
    const subtitle = "A focused 360 for leadership clarity and impact";
    const intro = "The Clarity Index is a developmental feedback tool designed to support leadership self-awareness, insight, and focused growth conversations. It is not intended for performance management, compensation decisions, or disciplinary action.";
    const tagline = "Clarity creates choice. Choice creates growth.";

    pdf.addImage(clarityHeaderLogo, "PNG", centerX - 52, 24, 104, 38);

    pdf.setFont("times", "italic");
    pdf.setFontSize(10.5);
    pdf.text(subtitle, centerX, 71, { align: "center" });

    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    pdf.line(margin, 79, width - margin, 79);

    pdf.setFont("times", "normal");
    pdf.setFontSize(9.5);
    const introLines = pdf.splitTextToSize(intro, width - margin * 2 - 10);
    pdf.text(introLines, centerX, 86, { align: "center" });

    pdf.line(margin, 112, width - margin, 112);
    pdf.line(centerX - 18, 120, centerX + 18, 120);

    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.text(name, centerX, 132, { align: "center" });

    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    pdf.text(formattedDate, centerX, 141, { align: "center" });

    pdf.line(centerX - 16, 148, centerX + 16, 148);
    pdf.line(margin, 154, width - margin, 154);
    pdf.line(centerX - 16, 160, centerX + 16, 160);

    pdf.addImage(newLogo, "PNG", centerX - 20, 168, 40, 40);
    pdf.text(".", centerX, 212, { align: "center" });

    pdf.setFont("times", "bolditalic");
    pdf.setFontSize(10.5);
    pdf.text(tagline, centerX, 220, { align: "center" });
    pdf.addPage();

    // Page 2 (Left blank to put in table of content later)
    pdf.addPage();

    // Page 3
    yPos = addHeader(pdf, "Introduction to Your Clarity Index 360™ Report", margin);
    yPos = addSubheader(pdf, "Purpose of the Clarity Index 360™", yPos);
    yPos = addBody(pdf, "The Clarity Index 360™ is a facilitated, developmental leadership insight tool designed to help leaders understand how their leadership behaviours are experienced, perceived, and felt by others at work.", yPos);
    yPos = addBody(pdf, "Rather than measuring everything at once, the Clarity Index 360 intentionally focuses on a small number of priority behaviours that matter most for effectiveness, relationships, and impact right now. The goal is not perfection, comparison, or judgment, it is clarity: clarity about what is working well, where leadership impact is strongest, and where focused attention or refinement may be useful.", yPos);

    yPos = addSubheader(pdf, "How the Clarity Index 360 Is Designed", yPos);
    yPos = addBody(pdf, "The Clarity Index 360 differs from traditional 360-degree feedback tools in several important ways:", yPos);
    yPos = addIndentBody(pdf, "It is focused and bespoke, rather than broad or competency heavy.\nIt is administered and facilitated by The LIVE. LEARN. GROW. Company, a division of LeBlanc Leadership Group Inc.\nIt prioritizes insight over volume, collecting only data that will be used.\nIt is never delivered without facilitation, ensuring context, care, and meaning.\nIt treats feedback as developmental input, not evaluative judgment.", yPos);
    yPos = addBody(pdf, "Each Clarity Index 360 is customized based on the leader's role, context, goals, and coaching focus. Questions are drawn from a curated menu of behavioural statements and open-ended prompts, with a maximum of:", yPos);
    yPos = addIndentBody(pdf, "Approximately 10 rating questions, and\n3-5 narrative questions", yPos);
    yPos = addBody(pdf, "All raters are asked to respond based on direct observation of behaviour, not intent, personality, or assumptions. There are no right or wrong answers - honest, thoughtful input helps surface patterns that support reflection, learning, and constructive conversation.", yPos);
    pdf.addPage();

    // Page 4
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
    yPos = addBody(pdf, "The value of this report lies not in the numbers alone, but in the quality of reflection and conversation it enables. It is intended to be explored thoughtfully, with curiosity and care, as part of an ongoing leadership development journey.", yPos);
    pdf.addPage();

    // Page 5
    yPos = addHeader(pdf, "Interpreting Your Results", margin);
    yPos = addBody(pdf, "The pages that follow present multiple perspectives on how your leadership behaviours are experienced by others. Rather than focusing on individual scores or isolated data points, this report is best read by noticing patterns, alignment, and areas of difference across perspectives.", yPos);
    yPos = addBody(pdf, "No single score tells the full story. What matters most is how the information comes together to support reflection, insight, and meaningful conversation.", yPos);
    yPos = addBody(pdf, "This report is designed to be explored thoughtfully and, where possible, in dialogue with a coach or facilitator. Its purpose is not judgment or evaluation, but clarity about what is working well, where your leadership impact is strongest, and where focused attention may be useful.", yPos);
    addBody(pdf, "As you review the results, consider approaching them with curiosity rather than conclusion.", yPos);
}

function createChartPage(pdf, image, imageWidth, imageHeight, cat, desc) {
    pdf.addPage();
    let yPos = addHeader(pdf, cat, margin);
    if (desc) {
        yPos = addSubheader(pdf, desc, yPos);

    }
    yPos += blankLine;
    pdf.addImage(image, "PNG", (width - imageWidth) / 2, yPos, imageWidth, imageHeight);
    cats.push(cat);
    descs.push(desc);
}

function addContent(pdf, header, subheader, yPos, page, indent) {
    pdf.setTextColor("#000");

    const startX = margin + indent;
    const pageX = width - margin;
    const pageText = String(page);
    const gapToPage = spacing * 2;

    // Reserve a right-side column for page numbers so long ToC labels wrap cleanly.
    pdf.setFontSize(11);
    const pageTextWidth = pdf.getTextWidth(pageText);
    const availableWidth = Math.max(20, pageX - pageTextWidth - gapToPage - startX);

    const text = [header, subheader].filter(Boolean).join(" ");
    pdf.setFont("helvetica", header ? "bold" : "normal");
    const lines = pdf.splitTextToSize(text, availableWidth);
    pdf.text(lines, startX, yPos);

    pdf.setFont("helvetica", "bold");
    pdf.text(pageText, pageX, yPos, { align: "right" });

    return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + (blankLine * 0.6);
}

function createNarrativePage(pdf, question, responses) {
    pdf.addPage();
    let yPos = addHeader(pdf, question, margin);
    let response = responses.join("\n");
    addBody(pdf, response, yPos);
    cats.push(question)
    descs.push("");
}

function createToCPage(pdf) {
    let yPos = addHeader(pdf, "Table of Contents", margin);
    yPos = addContent(pdf, "INTRODUCTION TO YOUR CLARITY INDEX 360 REPORT", null, yPos, "3", 0);
    yPos = addContent(pdf, null, "Purpose of the Clarity Index 360", yPos, "3", spacing);
    yPos = addContent(pdf, null, "How the Clarity Index 360 Is Designed", yPos, "3", spacing);
    yPos = addContent(pdf, "INTERPRETING YOUR RESULTS", null, yPos, "5", 0);
    yPos = addContent(pdf, cats[0], descs[0], yPos, "6", 0);
    for (let i = 1; i < cats.length; i++) {
        yPos = addContent(pdf, cats[i], descs[i], yPos, String(i + 6), spacing);
    }
}

function CreateGraph() {
    const chartRefs = useRef([]);
    const scatterRefs = useRef([]);
    const distributionRef = useRef(); // we only have 1
    const heatmapRef = useRef();

    const handleDownload = async () => {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            lineHeight: lineHeight
        });

        createContextPages(pdf, "testName", margin);
        for (let i = 0; i < scaleResponses.length; i++) {
            createChartPage(pdf, scatterRefs.current[i].toBase64Image("image/png", 2), width - margin * 2, (scatterRefs.current[i].height / scatterRefs.current[i].width) * (width - margin * 2), scaleResponses[i].question, "");
        }
        createChartPage(pdf, distributionRef.current.toBase64Image("image/png", 2), width - margin * 2, (distributionRef.current.height / distributionRef.current.width) * (width - margin * 2), "Table 3: Ratings Distribution", "");

        // cannot add heatmap as referenced chart, need to use html2canvas to capture as image
        const canvas = await html2canvas(heatmapRef.current);
        const imgData = canvas.toDataURL("image/png");
        createChartPage(pdf, imgData, width - margin * 2, (canvas.height / canvas.width) * (width - margin * 2), "Table 2: Ratings Differentials", "")

        for (let item of narrativeResponses) {
            createNarrativePage(pdf, item.question, item.responses);
        }
        for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
            pdf.setPage(i);
            if (i === 2) { createToCPage(pdf) };
            addTemplate(pdf, String(i));
        }
        pdf.save("report.pdf");
    };

    let chartData = [];
    let overview = {
        "Self": 0,
        "Raters": 0
    };
    for (let resp of responses) {
        let { datasets, labels } = parseResponse(resp);
        chartData.push({
            labels: labels,
            datasets: datasets,
        });
        overview["Self"] += mean(datasets.find(d => d.label === "Self")["data"]);
        overview["Raters"] += mean(datasets.find(d => d.label === "Raters")["data"]);
    }
    const overviewData = {
        labels: Object.keys(overview),
        datasets: [
            {
                data: Object.values(overview).map(v => (v / 2)),
                backgroundColor: Object.keys(overview).map(k => roleColor[k])
            }
        ]
    };

    const scatterData = scaleResponses.map(parseScaleResponse);
    const distributionData = parseDistributionResponse(distributionResponses);
    return (
        <div>
            <Bar
                ref={(el) => (chartRefs.current[0] = el)}
                data={overviewData}
                options={{
                    indexAxis: "y",
                    responsive: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: "Overview",
                            font: {
                                size: 20
                            }
                        }
                    }
                }}
                width={1280}
                height={720}
            />
            {chartData.map((n, index) => {
                return <Bar
                    ref={(el) => (chartRefs.current[index + 1] = el)}
                    key={index}
                    data={n}
                    options={{
                        responsive: false,
                        plugins: {
                            legend: {
                                display: true,
                                labels: {
                                    font: {
                                        size: 20
                                    }
                                }
                            },
                        }
                    }}
                    width={1280}
                    height={720}
                />;
            })}
            {scatterData.map((n, index) => (
                <div key={index}>
                    <p><strong>{n.question}</strong></p>
                    <Scatter ref={el => scatterRefs.current[index] = el} data={{ datasets: n.datasets }} options={scatterOptions} height={80} />
                </div>
            ))}
            <Bar ref={distributionRef} data={distributionData} options={distributionOptions} />
            <HeatmapTable ref={heatmapRef} data={heatmapData} />
            <button onClick={handleDownload}>
                Download PDF
            </button>
        </div>
    );
}
export default CreateGraph
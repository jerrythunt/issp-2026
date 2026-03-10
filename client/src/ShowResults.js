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
import image1 from "./images/logo.png"
import image2 from "./images/competencies.png"
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
    return sum / arr.length;
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
                callback: function(value) {
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
        [4.00,  0.00, -0.33,  1.00,  0.00],
        [4.00,  0.20, -0.67,  1.00, -0.25],
        [5.00, -0.80, -2.00, -1.00, -1.00],
        [4.00, -0.80, -1.33,  0.00, -1.00],
        [5.00, -0.60, -1.00,  0.00, -0.25],
        [4.00, -0.40, -0.67,  0.00,  0.25],
        [4.00,  0.00,  0.00,  0.00, -0.25],
        [4.00, -0.40, -1.00,  0.00, -0.50],
        [4.00, -0.60, -1.00,  1.00, -0.25],
        [4.00,  0.00, -1.33,  0.00,  0.00],
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

const margin = 25.4; // 1 inch
const spacing = 5;
const body = margin * 2;
const width = 297;
const height = 210;
const footer = height - margin;
const regularFont = 12;
const headerFont = 14;
const lineHeight = 1.2;
const blankLine = 4.2333333333333325 * lineHeight;
const maxTextWidth = width - (margin * 2);
const maxIndentTextWidth = width - (margin * 3);
const today = new Date();

const image1Height = 15;
const image1Width = 30;

const image2Height = 100;
const image2Width = 100;

const chartWidth = width - margin * 2;
const chartHeight = chartWidth / 2;

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
            data.push(mean(response[role][q]));
        }
        datasets.push({
            label: role,
            backgroundColor: roleColor[role],
            data: data
        });
    }
    return { datasets, labels };
}

function addHeader(pdf, text, yPos) {
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#3360a0");
    pdf.setFont("helvetica", "bold");
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    pdf.text(lines, margin, yPos);
    return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + blankLine;
}

function addSubheader(pdf, text, yPos) {
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#3360a0");
    pdf.setFont("helvetica", "normal");
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    pdf.text(lines, margin, yPos);
    return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + blankLine;
}

function addBody(pdf, text, yPos) {
    pdf.setFontSize(regularFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "normal");
    let lines = pdf.splitTextToSize(text, maxTextWidth);
    pdf.text(lines, margin, yPos);
    return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + blankLine;
}

function addTemplate(pdf, pageNum) {
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "bold");
    pdf.text(pageNum, margin / 2, margin / 2);
    pdf.addImage(image1, "PNG", width / 2 - image1Width / 2, height - margin, image1Width, image1Height);
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
    pdf.text(lines, margin * 1.4, yPos);
    return yPos + (pdf.getTextDimensions("filler").h * lines.length * lineHeight) + blankLine;
}

function createContextPages(pdf, name) {
    let yPos = 0;

    // Page 1
    const text = "LEADERSHIP 360";
    const text2 = "In partnership with LeBlanc Leadership Group Inc.";
    const text3 = "The LIVE. LEARN. GROW. Company"
    pdf.setFontSize(26);
    pdf.setFont("times", "normal");
    pdf.text(text, margin, margin);
    const text1Width = pdf.getTextWidth(text);

    pdf.setFontSize(12);
    const text2Width = pdf.getTextWidth(text2);
    const text3Width = pdf.getTextWidth(text3);
    pdf.text(text2, width / 2 - text2Width / 2, footer - pdf.getFontSize() / 2);
    pdf.text(text3, width / 2 - text3Width / 2, footer);

    pdf.addImage(image1, "PNG", margin + text1Width + spacing, margin - (image1Height * 0.7), image1Width, image1Height);
    pdf.addImage(image2, "PNG", margin, body, image2Width, image2Height);

    pdf.setFontSize(26);
    pdf.setFont("helvetica", "normal");
    pdf.text(name, margin + image2Width + spacing, body + image2Height / 2 - pdf.getFontSize() / 2);
    pdf.text(formattedDate, margin + image2Width + spacing, body + image2Height / 2);
    pdf.addPage();

    // Page 2 (Left blank to put in table of content later)
    pdf.addPage();

    // Page 3
    const text4 = `Leadership development is a vital component of building a great organization. It allows you to shape the culture and strategy of the business. Developing and sharpening leadership skills across leadership will increase employee morale and retention, improve productivity, promote better decision making, build better teams, and result in a better work environment for everyone.
\nLeadership development is a lifelong process, not a one-off learning event. There is always something to be improved upon. It doesn’t need to be daunting or complicated. Slow, consistent development is the best approach. Small changes can end up making a huge impact on your career and work life.
\nYour leadership development journey starts with understanding the skills needed to be a leader at the LDB, recognizing and appreciating your strengths, and reflecting on what abilities you need to develop to improve your leadership impact.
\nThis Leadership 360 Assessment is a companion to the LDB Leadership Development Toolkit, providing valuable insights as you work to refine and enhance your leadership capabilities and capacity.
                `;
    const text5 = `A 360 is a powerful tool to better understand your leadership:`
    const text6 = `By gaining a deeper understanding of how you see yourself in relation to LDB Leadership Competencies.\nBy learning how those you work with see and perceive your leadership capabilities.\nBy hearing how others experience your leadership.\nHelping you connect your actions, approach, and behaviours to the work that you do, and better understand what is effective, what may not be as useful, and any gaps or invisible gaps that may exist.`;
    yPos = addHeader(pdf, "Introduction", margin);
    yPos = addSubheader(pdf, "Why leadership development?", yPos);
    yPos = addBody(pdf, text4, yPos);
    yPos = addSubheader(pdf, "What is a 360 assessment?", yPos);
    yPos = addBody(pdf, text5, yPos);
    yPos = addIndentBody(pdf, text6, yPos);
    pdf.addPage();

    // Page 4
    const text7 = `The LDB Leadership 360 is designed to provide data and insights. Using the LDB's 13 Leadership Competencies as a foundation, the 360 statements provide clarity around:`;
    const text8 = `How you see yourself as a leader. What do you believe about your effectiveness as a leader? Do you give yourself enough credit for the good things that you do? Are there practices or patterns in your leadership that were once effective, but no longer serve you? Are there things that you have been working on already? Gaps or invisible gaps in your leadership?\nHow key groups within your professional life see, perceive, and experience your leadership. What do they respect and appreciate about you as a leader? Are there behaviours or practices that perhaps are not as effective, potentially adding tension and conflict? Are these behaviours gaps things you are already familiar with and working on? Or are they invisible gaps, things you are unaware of, or have not been brought to your attention?`;
    const text9 = `Your coach will walk you through the following pages of this report, helping you to interpret the data provided. As you review the responses, it is important to keep in mind that everyone's experience will vary, which will be reflected in the results. Through discussion with your coach, through taking time to reflect on the data, and taking time to notice and observe your day-to-day actions and behaviours, you will be able to make meaning of what is contained in your 360 report.\n\nIn addition to the 360 results contained within this report, keep a copy of the LDB Leadership Development Toolkit close by. While the 360 report provides a snapshot of where you may be as a leader, the toolkit breaks down each competency in detail, providing key success factors and sample behaviours and actions that demonstrate effective leadership.\n\nIn combination, these two leadership development tools contain a wealth of insights as you continue to refine and enhance your leadership practice. With the support of your coach and your own leader(s), you will be able to:`;
    const text10 = `Make meaning of the insights and data from your 360.\nGain a deeper appreciation of the good work you do as a leader within the LDB.\nIdentify opportunities for further growth and development as a leader.\nDevelop meaningful and impactful goals as part of your MyP3 process.\nDeepen your self-awareness.\nGrow, both professionally and personally.`;

    yPos = addHeader(pdf, "How to use this report", margin);
    yPos = addBody(pdf, text7, yPos);
    yPos = addIndentBody(pdf, text8, yPos);
    yPos = addBody(pdf, text9, yPos);
    addIndentBody(pdf, text10, yPos);
}

function createChartPage(pdf, image, cat, desc) {
    pdf.addPage();
    let yPos = addHeader(pdf, cat, margin);
    if (desc) {
        yPos = addSubheader(pdf, desc, yPos);

    }
    yPos += blankLine;
    pdf.addImage(image, "PNG", (width - chartWidth) / 2, yPos, chartWidth, chartHeight);
    cats.push(cat);
    descs.push(desc);
}

function addContent(pdf, header, subheader, yPos, page, indent) {
    pdf.setTextColor("#000");
    pdf.setFontSize(regularFont);
    pdf.setFont("helvetica", "bold");
    let headerWidth = 0;
    if (header) {
        pdf.text(header, margin + indent, yPos);
        headerWidth = pdf.getTextWidth(header);
    }

    pdf.text(page, width - margin, yPos);
    pdf.setFont("helvetica", "normal");
    let lines = []
    if (subheader) {
        lines = pdf.splitTextToSize(subheader, maxTextWidth);
        pdf.text(lines, margin + indent + headerWidth + spacing, yPos);
    }
    if (lines.length > 0) {
        return yPos + (pdf.getTextDimensions("filler").h * (lines.length - 1) * lineHeight) + blankLine;
    }
    return yPos + (pdf.getTextDimensions("filler").h * (lines.length) * lineHeight) + blankLine;

}

function createToCPage(pdf) {
    let yPos = addHeader(pdf, "Table of Contents", margin);
    yPos = addContent(pdf, "INTRODUCTION", null, yPos, "3", 0);
    yPos = addContent(pdf, null, "Why leadership development?", yPos, "3", spacing);
    yPos = addContent(pdf, null, "What is a 360 assessment?", yPos, "3", spacing);
    yPos = addContent(pdf, "HOW TO USE THIS REPORT", null, yPos, "4", 0);
    yPos = addContent(pdf, cats[0], descs[0], yPos, "5", 0);
    for (let i = 1; i < cats.length; i++) {
        yPos = addContent(pdf, cats[i], descs[i], yPos, String(i + 5), spacing);
    }
}

function CreateGraph() {
    const chartRefs = useRef([]);
    const scatterRefs = useRef([]);
    const distributionRef = useRef(); // we only have 1
    const heatmapRef = useRef();

    const handleDownload = async () => {
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
            lineHeight: lineHeight
        });

        const printW = width - margin * 2;

        function setTitle(title, kwargs = {}) {
            if (!title) return;
            pdf.setFontSize(headerFont);
            pdf.setTextColor("#3360a0");
            pdf.setFont("helvetica", "bold");
            pdf.text(title, ...kwargs);
        }

        function addChartPage(ref, title = null) {
            if (!ref) return;
            pdf.addPage();
            let yPos = margin;
            if (title) {
                // pdf.setFontSize(headerFont);
                // pdf.setTextColor("#3360a0");
                // pdf.setFont("helvetica", "bold");
                // pdf.text(title, margin, yPos);
                setTitle(title, [margin, yPos]);
                yPos += pdf.getTextDimensions("filler").h + blankLine;
            }
            const imgData = ref.toBase64Image("image/png", 1);
            const imgHeight = (ref.height / ref.width) * printW;
            pdf.addImage(imgData, "PNG", margin, yPos, printW, imgHeight);
        }
        createContextPages(pdf, "testName", margin);
        for (let image of chartRefs.current) {
            createChartPage(pdf, image.toBase64Image("image/png", 2), "category", "description of category, can be empty string.");
        }
        for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
            pdf.setPage(i);
            if (i === 2) { createToCPage(pdf) };
            addTemplate(pdf, String(i));
        }

        for (let i = 0; i < scaleResponses.length; i++) addChartPage(scatterRefs.current[i], scaleResponses[i].question);
        addChartPage(distributionRef.current, "Table 3: Ratings Distribution");

        // cannot add heatmap as referenced chart, need to use html2canvas to capture as image
        const canvas = await html2canvas(heatmapRef.current);
        const imgData = canvas.toDataURL("image/png");
        pdf.addPage();
        setTitle("Table 2: Ratings Differentials", [margin, margin]);
        const imgHeight = (canvas.height / canvas.width) * printW;
        pdf.addImage(imgData, "PNG", margin, margin, printW, imgHeight);

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
                data: Object.values(overview).map(v => v / 2),
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
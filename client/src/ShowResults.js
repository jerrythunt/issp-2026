import { useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import image1 from "./images/logo.png"
import image2 from "./images/competencies.png"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
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

const responses = [{
    Self: { q1: [5], q2: [3], q3: [4] },
    Peers: { q1: [3, 3, 5, 5, 4], q2: [4, 4, 4, 3, 5], q3: [2, 2, 3, 3, 2] },
    DirectReports: { q1: [4, 4, 2], q2: [5, 5, 4], q3: [3, 3, 5] },
    Leader: { q1: [4], q2: [4], q3: [5] },
    Raters: { q1: [3, 3, 5, 5, 4, 4, 4, 2, 4], q2: [4, 4, 4, 3, 5, 5, 5, 4], q3: [2, 2, 3, 3, 2, 3, 3, 5, 5] }
}, {
    Self: { q1: [1], q2: [1], q3: [1] },
    Peers: { q1: [2, 2], q2: [2, 2, 2, 2, 2], q3: [2, 2, 2, 2, 2] },
    DirectReports: { q1: [3, 3, 3], q2: [3, 3, 3], q3: [3, 3, 3] },
    Leader: { q1: [4], q2: [4], q3: [4] },
    Raters: { q1: [2, 2, 2, 2, 2, 3, 3, 3, 4], q2: [2, 2, 2, 2, 2, 3, 3, 3, 4], q3: [2, 2, 2, 2, 2, 3, 3, 3, 4] }
}]

const image1Height = 15;
const image1Width = 30;

const image2Height = 100;
const image2Width = 100;

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

const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

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

function createContextPages(pdf, name) {
    let headers = ["Introduction", "How to use this report"];
    let subheaders = ["Why leadership developement?", "What is a 360 assessment?"]

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
    pdf.setFontSize(headerFont);
    pdf.setTextColor("#3360a0");
    pdf.setFont("helvetica", "bold");
    pdf.text(headers[0], margin, margin);
    let yPos = margin + pdf.getTextDimensions("filler").h;
    yPos += blankLine;
    
    pdf.setFont("helvetica", "normal");
    pdf.text(subheaders[0], margin, yPos);
    yPos += pdf.getTextDimensions("filler").h;
    yPos += blankLine;

    pdf.setTextColor("#000");
    pdf.setFontSize(regularFont);
    let lines = pdf.splitTextToSize(text4, maxTextWidth);
    pdf.text(lines, margin, yPos);
    yPos += pdf.getTextDimensions("filler").h * lines.length * lineHeight;
    yPos += blankLine;

    pdf.setFontSize(headerFont);
    pdf.setTextColor("#3360a0");
    pdf.text(subheaders[1], margin, yPos);
    yPos += pdf.getTextDimensions("filler").h;
    yPos += blankLine;

    pdf.setTextColor("#000");
    pdf.setFontSize(regularFont);
    pdf.text(text5, margin, yPos);
    yPos += pdf.getTextDimensions(text5).h;
    yPos += blankLine/2;

    lines = pdf.splitTextToSize(text6, maxIndentTextWidth);
    pdf.text(lines, margin * 1.5, yPos);
    pdf.addPage();

    // Page 4
    const text7 = `The LDB Leadership 360 is designed to provide data and insights. Using the LDB's 13 Leadership Competencies as a foundation, the 360 statements provide clarity around:`;
    const text8 = `How you see yourself as a leader. What do you believe about your effectiveness as a leader? Do you give yourself enough credit for the good things that you do? Are there practices or patterns in your leadership that were once effective, but no longer serve you? Are there things that you have been working on already? Gaps or invisible gaps in your leadership?\nHow key groups within your professional life see, perceive, and experience your leadership. What do they respect and appreciate about you as a leader? Are there behaviours or practices that perhaps are not as effective, potentially adding tension and conflict? Are these behaviours gaps things you are already familiar with and working on? Or are they invisible gaps, things you are unaware of, or have not been brought to your attention?`;
    const text9 = `Your coach will walk you through the following pages of this report, helping you to interpret the data provided. As you review the responses, it is important to keep in mind that everyone's experience will vary, which will be reflected in the results. Through discussion with your coach, through taking time to reflect on the data, and taking time to notice and observe your day-to-day actions and behaviours, you will be able to make meaning of what is contained in your 360 report.\n\nIn addition to the 360 results contained within this report, keep a copy of the LDB Leadership Development Toolkit close by. While the 360 report provides a snapshot of where you may be as a leader, the toolkit breaks down each competency in detail, providing key success factors and sample behaviours and actions that demonstrate effective leadership.\n\nIn combination, these two leadership development tools contain a wealth of insights as you continue to refine and enhance your leadership practice. With the support of your coach and your own leader(s), you will be able to:`;
    const text10 =  `Make meaning of the insights and data from your 360.\nGain a deeper appreciation of the good work you do as a leader within the LDB.\nIdentify opportunities for further growth and development as a leader.\nDevelop meaningful and impactful goals as part of your MyP3 process.\nDeepen your self-awareness.\nGrow, both professionally and personally.`;

    pdf.setFontSize(headerFont);
    pdf.setTextColor("#3360a0");
    pdf.setFont("helvetica", "bold");
    pdf.text(headers[1], margin, margin);
    yPos = pdf.getTextDimensions("filler").h + margin;
    yPos += blankLine;

    pdf.setTextColor("#000");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(regularFont);
    lines = pdf.splitTextToSize(text7, maxTextWidth);
    pdf.text(lines, margin, yPos);
    yPos += pdf.getTextDimensions("filler").h * lines.length * lineHeight;
    yPos += blankLine/2;

    lines = pdf.splitTextToSize(text8, maxIndentTextWidth);
    pdf.text(lines, margin * 1.5, yPos);
    yPos += pdf.getTextDimensions("filler").h * lines.length * lineHeight;
    yPos += blankLine;

    lines = pdf.splitTextToSize(text9, maxTextWidth);
    pdf.text(lines, margin, yPos);
    yPos += pdf.getTextDimensions("filler").h * lines.length * lineHeight;
    yPos += blankLine/2;

    lines = pdf.splitTextToSize(text10, maxIndentTextWidth);
    pdf.text(lines, margin * 1.5, yPos);
    yPos += pdf.getTextDimensions("filler").h * lines.length * lineHeight;
    yPos += blankLine;
}

function CreateGraph() {
    const chartRef = useRef(null);

    const handleDownload = () => {
        // const imgData = chartRef.current.toBase64Image("image/png", 1.5);
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
            lineHeight: lineHeight
        });

        createContextPages(pdf, "Bob", margin);
        pdf.save("report.pdf");
    };

    let chartData = [];
    for (let resp of responses) {
        let { datasets, labels } = parseResponse(resp);
        chartData.push({
            labels: labels,
            datasets: datasets,
        });
    }

    return (
        <div style={{ width: "50%", height: "25%" }}>
            {chartData.map((n, index) => {
                return <Bar ref={chartRef} key={index} data={n} />;
            })}
            <button onClick={handleDownload}>
                Download PDF
            </button>
        </div>
    );
}
export default CreateGraph
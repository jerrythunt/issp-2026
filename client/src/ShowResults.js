import React, { useRef } from "react";
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
import logo from "./logo.png"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const mean = (array) => {
    return array.reduce((sum, value) => sum + value, 0) / array.length;
};

// 3 different questions, 5 peers, 3 direct reports
const resp = {
    Self: { q1: [5], q2: [3], q3: [4] },
    Peers: { q1: [3, 3, 5, 5, 4], q2: [4, 4, 4, 3, 5], q3: [2, 2, 3, 3, 2] },
    DirectReports: { q1: [4, 4, 2], q2: [5, 5, 4], q3: [3, 3, 5] },
    Leader: { q1: [4], q2: [4], q3: [5] },
    Raters: { q1: [3, 3, 5, 5, 4, 4, 4, 2, 4], q2: [4, 4, 4, 3, 5, 5, 5, 4], q3: [2, 2, 3, 3, 2, 3, 3, 5, 5] }
};

function CreateGraph() {
    const chartRef = useRef(null);

    const handleDownload = () => {

        const imgData = chartRef.current.toBase64Image("image/png", 1.5);

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        pdf.setFontSize(10);
        pdf.text("1", margin/2, 8);
        pdf.setTextColor("blue");
        pdf.text("Demonstrate Emotional Intelligence – Use emotional information to guide thinking and behaviour and strengthen interpersonal relationships.", margin, margin)

        pdf.addImage(imgData, "PNG", (pageWidth - 150)/2, margin, 150, 100);
        pdf.addImage(logo, "PNG", (pageWidth - 30)/2, pageHeight - 20, 30, 15);
        pdf.save("chart.pdf");
    };

    const data = {
        labels: ["q1", "q2", "q3"],
        datasets: [
            {
                label: "Self",
                backgroundColor: "#0047AB",
                data: [
                    mean(resp.Self.q1),
                    mean(resp.Self.q2),
                    mean(resp.Self.q3),
                ],
            },
            {
                label: "Raters",
                backgroundColor: "#ffb300",
                data: [
                    mean(resp.Raters.q1),
                    mean(resp.Raters.q2),
                    mean(resp.Raters.q3),
                ],
            },
            {
                label: "Leader",
                backgroundColor: "#838383",
                data: [
                    mean(resp.Leader.q1),
                    mean(resp.Leader.q2),
                    mean(resp.Leader.q3),
                ],
            },
            {
                label: "Peers",
                backgroundColor: "#40E0D0",
                data: [
                    mean(resp.Peers.q1),
                    mean(resp.Peers.q2),
                    mean(resp.Peers.q3),
                ],
            },
            {
                label: "Direct Reports",
                backgroundColor: "#1b7c00",
                data: [
                    mean(resp.DirectReports.q1),
                    mean(resp.DirectReports.q2),
                    mean(resp.DirectReports.q3),
                ],
            },
        ],
    };
    const options = {
        responsive: true,
        devicePixelRatio: 10,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
            },
        },
    };
    return (
        <div style={{ width: "50%", height: "25%" }}>
            <Bar ref={chartRef} data={data} options={options} />
            <button onClick={handleDownload}>
                Download PDF
            </button>
        </div>

    );
}
export default CreateGraph
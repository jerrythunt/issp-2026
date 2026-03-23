import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getAssessmentDetails } from "./services/api";
import { getAssessmentProgress } from "./utils/assessmentStatus";
import {
  getScaledAveragesFromResponses,
  getTextResponsesFromResponses,
} from "./utils/assessmentDetailsStats";
import AssessmentChart from "./AssessmentChart";

function AssessmentDetails() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const exportRef = useRef(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        const data = await getAssessmentDetails(id);
        setAssessment(data);
      } catch (error) {
        console.error("Failed to load assessment details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!exportRef.current) return;

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f3f4f6",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      const safeClientName = assessment.clientName.replace(/[^a-z0-9]/gi, "_");
      pdf.save(`${safeClientName}_assessment_report.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  if (loading) {
    return <div style={pageStyle}><p>Loading assessment details...</p></div>;
  }

  if (!assessment) {
    return <div style={pageStyle}><p>Assessment not found.</p></div>;
  }

  const progress = getAssessmentProgress(assessment);
  const responses = assessment.responses || [];
  const scaledAverages = getScaledAveragesFromResponses(responses);
  const textResponses = getTextResponsesFromResponses(responses);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={topBarStyle}>
          <h1 style={titleStyle}>Assessment Details</h1>
          <button onClick={handleDownloadPdf} style={downloadBtnStyle}>
            Download PDF
          </button>
        </div>

        <div ref={exportRef}>
          {/* 1. Summary Card */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{assessment.clientName}</h2>
            <p><strong>Survey:</strong> {assessment.surveyName}</p>
            <p><strong>Deadline:</strong> {assessment.deadline}</p>
            <p><strong>Responses:</strong> {progress.submitted}/{progress.total}</p>
            <p><strong>Status:</strong> {progress.label}</p>
          </div>

          {/* 2. Results Chart Card (NEW) */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Results Chart</h2>
            {scaledAverages.length === 0 ? (
              <p style={mutedTextStyle}>No scaled responses yet.</p>
            ) : (
              <AssessmentChart averages={scaledAverages} />
            )}
          </div>

          {/* 3. Scaled Question Averages Card */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Scaled Question Averages</h2>
            {scaledAverages.length === 0 ? (
              <p style={mutedTextStyle}>No scaled responses yet.</p>
            ) : (
              <ul style={{ paddingLeft: "20px" }}>
                {scaledAverages.map((item, index) => (
                  <li key={index} style={{ marginBottom: "10px", color: "#111827" }}>
                    <strong>{item.questionText}</strong>: {item.average} / 5
                    {" "}({item.responsesCount} response
                    {item.responsesCount !== 1 ? "s" : ""})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. Written Responses Card */}
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Written Responses</h2>
            {Object.keys(textResponses).length === 0 ? (
              <p style={mutedTextStyle}>No written responses yet.</p>
            ) : (
              Object.entries(textResponses).map(([questionText, responsesList], index) => (
                <div key={index} style={textBlockStyle}>
                  <h3 style={{ marginTop: 0 }}>{questionText}</h3>
                  {responsesList.map((response, rIndex) => (
                    <div key={rIndex} style={responseCardStyle}>
                      <div style={responseRaterStyle}>{response.raterName}</div>
                      <div style={responseTextStyle}>{response.answer}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles (Same as before) ---
const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  padding: "40px 24px",
};

const containerStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const titleStyle = {
  margin: 0,
  fontSize: "2.2rem",
  color: "#111827",
};

const downloadBtnStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "999px",
  padding: "12px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  padding: "28px",
  marginBottom: "24px",
  color: "#111827",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#111827",
};

const mutedTextStyle = {
  color: "#6b7280",
};

const textBlockStyle = {
  marginBottom: "24px",
};

const responseCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px 16px",
  backgroundColor: "#f9fafb",
  marginBottom: "10px",
};

const responseRaterStyle = {
  fontWeight: "700",
  marginBottom: "6px",
};

const responseTextStyle = {
  color: "#374151",
  whiteSpace: "pre-wrap",
};

export default AssessmentDetails;
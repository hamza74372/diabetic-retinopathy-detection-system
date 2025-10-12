import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './ReportModal.css';

const ReportModal = ({ user, result, onClose }) => {
  const reportRef = useRef();

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    // Increase scale for better PDF quality
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`dr-report-${user?.profile?.name?.replace(' ', '_') ?? 'report'}-${new Date().toLocaleDateString()}.pdf`);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* This is the content that will be converted to PDF */}
        <div ref={reportRef} className="report-container">
          <div className="report-header">
            <h1 className="report-main-title">AI Diagnostic Report</h1>
            <h2 className="report-subtitle">Diabetic Retinopathy Analysis</h2>
          </div>

          <div className="report-body">
            <div className="info-column">
              <h3 className="section-title">Patient Details</h3>
              <div className="info-grid">
                <p><strong>Name:</strong></p><p>{user?.profile?.name}</p>
                <p><strong>Age:</strong></p><p>{user?.profile?.age}</p>
                <p><strong>Gender:</strong></p><p>{user?.profile?.gender}</p>
                <p><strong>Patient ID:</strong></p><p>{user?.auth?.uid.substring(0, 10).toUpperCase()}</p>
              </div>
            </div>

            <div className="result-column">
              <h3 className="section-title">Analysis Results</h3>
              <div className="result-box">
                <p className="result-label">AI-Predicted Diagnosis</p>
                <p className="result-value diagnosis-value">{result?.class}</p>
                <p className="result-label">Confidence Score</p>
                <p className="result-value confidence-value">{(result?.confidence * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="report-footer">
            <p><strong>Generated on:</strong> {new Date().toLocaleString()}</p>
            <p className="disclaimer">
              <strong>Disclaimer:</strong> This is an AI-generated report for screening purposes and is not a substitute for a professional medical diagnosis. Please consult with a qualified ophthalmologist for a definitive evaluation.
            </p>
          </div>
        </div>
        {/* End of PDF content */}

        <div className="modal-actions">
          <button onClick={handleDownloadPdf} className="action-button download">Download as PDF</button>
          <button onClick={onClose} className="action-button close">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
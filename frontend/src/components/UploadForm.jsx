import React, { useState } from 'react';

// Function to send image to Flask backend
const sendImageForPrediction = async (preview) => {
  try {
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_base64: preview }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.class || !data.confidence) {
      throw new Error('Incomplete response from server');
    }

    return {
      class: data.class,
      confidence: parseFloat(data.confidence),
      timestamp: new Date().toISOString(), // Generate local timestamp
      imageData: preview
    };
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
};

// Class descriptions for better understanding
const classDescriptions = {
  'No DR': {
    title: 'No Diabetic Retinopathy',
    description: 'No signs of diabetic retinopathy detected. The retina appears healthy with no damage from diabetes.',
    severity: 'Normal',
    color: '#10b981'
  },
  'Mild': {
    title: 'Mild Diabetic Retinopathy',
    description: 'Early stage of diabetic retinopathy with small areas of swelling in the retina\'s blood vessels (microaneurysms).',
    severity: 'Early Stage',
    color: '#f59e0b'
  },
  'Moderate': {
    title: 'Moderate Diabetic Retinopathy',
    description: 'More advanced stage with blocked blood vessels that nourish the retina, causing more noticeable changes.',
    severity: 'Intermediate',
    color: '#f97316'
  },
  'Severe': {
    title: 'Severe Diabetic Retinopathy',
    description: 'Advanced stage where many more blood vessels are blocked, depriving several areas of the retina of blood supply.',
    severity: 'Advanced',
    color: '#ef4444'
  },
  'Proliferative DR': {
    title: 'Proliferative Diabetic Retinopathy',
    description: 'Most advanced stage where new, abnormal blood vessels grow in the retina. This can cause severe vision loss.',
    severity: 'Critical',
    color: '#dc2626'
  }
};

// ResultCard Component
function ResultCard({ prediction }) {
  if (!prediction) return null;

  const confidence = parseFloat(prediction.confidence) || 0;
  const analysisDate = new Date(prediction.timestamp || Date.now());
  const classInfo = classDescriptions[prediction.class] || classDescriptions['No DR'];

  const getColor = () => {
    if (confidence >= 0.8) return { 
      primary: '#10b981', 
      bg: '#ecfdf5', 
      text: '#065f46',
      gradient: 'linear-gradient(to right, #10b981, #16a34a)'
    };
    if (confidence >= 0.5) return { 
      primary: '#f59e0b', 
      bg: '#fffbeb', 
      text: '#92400e',
      gradient: 'linear-gradient(to right, #f59e0b, #ea580c)'
    };
    return { 
      primary: '#ef4444', 
      bg: '#fef2f2', 
      text: '#991b1b',
      gradient: 'linear-gradient(to right, #ef4444, #db2777)'
    };
  };

  const colors = getColor();

  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return { level: 'High Confidence', description: 'Very reliable prediction' };
    if (confidence >= 0.5) return { level: 'Medium Confidence', description: 'Moderately reliable prediction' };
    return { level: 'Low Confidence', description: 'Further examination recommended' };
  };

  const confidenceInfo = getConfidenceLevel();

  // Generate recommendation based on class
  const getRecommendation = () => {
    switch (prediction.class) {
      case 'No DR':
        return confidence >= 0.8
          ? 'No signs of diabetic retinopathy detected with high confidence. Regular eye check-ups are recommended to monitor eye health.'
          : confidence >= 0.5
            ? 'No signs of diabetic retinopathy detected with moderate confidence. Consider follow-up with a healthcare provider for confirmation.'
            : 'No signs of diabetic retinopathy detected, but low confidence suggests further clinical evaluation.';
      case 'Mild':
        return confidence >= 0.8
          ? 'Mild diabetic retinopathy detected with high confidence. Consult an eye care specialist for monitoring and management.'
          : confidence >= 0.5
            ? 'Mild diabetic retinopathy detected with moderate confidence. Clinical correlation with a specialist is recommended.'
            : 'Mild diabetic retinopathy detected, but low confidence requires immediate professional evaluation.';
      case 'Moderate':
        return confidence >= 0.8
          ? 'Moderate diabetic retinopathy detected with high confidence. Urgent consultation with an eye care specialist is recommended.'
          : confidence >= 0.5
            ? 'Moderate diabetic retinopathy detected with moderate confidence. Prompt evaluation by a specialist is advised.'
            : 'Moderate diabetic retinopathy detected, but low confidence requires urgent professional evaluation.';
      case 'Severe':
        return confidence >= 0.8
          ? 'Severe diabetic retinopathy detected with high confidence. Immediate consultation with an eye care specialist is critical.'
          : confidence >= 0.5
            ? 'Severe diabetic retinopathy detected with moderate confidence. Urgent specialist evaluation is strongly recommended.'
            : 'Severe diabetic retinopathy detected, but low confidence requires immediate professional evaluation.';
      case 'Proliferative DR':
        return confidence >= 0.8
          ? 'Proliferative diabetic retinopathy detected with high confidence. Immediate medical intervention is critical; consult an eye care specialist urgently.'
          : confidence >= 0.5
            ? 'Proliferative diabetic retinopathy detected with moderate confidence. Urgent evaluation and treatment by a specialist are strongly recommended.'
            : 'Proliferative diabetic retinopathy detected, but low confidence requires immediate professional evaluation.';
      default:
        return 'Please consult with a healthcare provider for proper clinical correlation.';
    }
  };

  const generatePDFReport = () => {
    // Create a simple HTML string that will definitely render
    const reportHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #333; font-size: 24px; margin: 0;">Retinal Analysis Report</h1>
          <p style="color: #666; margin: 5px 0;">AI-Powered Diabetic Retinopathy Detection</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Analysis Results</h2>
          <div style="background: #f5f5f5; padding: 15px; border: 2px solid #333; text-align: center;">
            <h3 style="font-size: 20px; margin: 0 0 10px 0; color: #333;">${prediction.class}</h3>
            <p style="margin: 5px 0;">Confidence Level: <strong>${(confidence * 100).toFixed(1)}%</strong></p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Understanding Your Results</h2>
          <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #007acc;">
            <p style="margin: 5px 0;"><strong>Condition:</strong> ${classInfo.title}</p>
            <p style="margin: 5px 0;"><strong>Severity Level:</strong> ${classInfo.severity}</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${classInfo.description}</p>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Report Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; font-weight: bold;">Analysis Date:</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${analysisDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; font-weight: bold;">Analysis Time:</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${analysisDate.toLocaleTimeString()}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; font-weight: bold;">Detected Condition:</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${classInfo.title}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; background: #f9f9f9; font-weight: bold;">Confidence Level:</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${confidenceInfo.level}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Clinical Interpretation</h2>
          <div style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd;">
            <p style="margin: 8px 0;"><strong>Prediction:</strong> ${classInfo.title}</p>
            <p style="margin: 8px 0;"><strong>Confidence Score:</strong> ${(confidence * 100).toFixed(1)}% - ${confidenceInfo.description}</p>
            <p style="margin: 8px 0;"><strong>Medical Description:</strong> ${classInfo.description}</p>
            <p style="margin: 8px 0;"><strong>Recommendation:</strong> ${getRecommendation()}</p>
          </div>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">Medical Disclaimer</h3>
          <p style="color: #856404; margin: 0; font-size: 14px;">
            This AI analysis is for informational purposes only and should not be used as a substitute for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment decisions.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Retinal Analysis System - AI-Powered Diabetic Retinopathy Detection</p>
        </div>
      </div>
    `;

    try {
      // Try using jsPDF directly for better compatibility
      if (typeof window.jsPDF === 'undefined') {
        // Load jsPDF if not available
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generateWithJsPDF();
        document.head.appendChild(script);
      } else {
        generateWithJsPDF();
      }

      function generateWithJsPDF() {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFontSize(20);
        doc.text('Retinal Analysis Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('AI-Powered Diabetic Retinopathy Detection', 105, 30, { align: 'center' });
        
        // Add a line
        doc.line(20, 35, 190, 35);
        
        // Analysis Results
        doc.setFontSize(16);
        doc.text('Analysis Results', 20, 50);
        
        doc.setFontSize(14);
        doc.text(`Detected Condition: ${prediction.class}`, 20, 65);
        doc.text(`Confidence Level: ${(confidence * 100).toFixed(1)}%`, 20, 75);
        
        // Understanding Results
        doc.setFontSize(16);
        doc.text('Understanding Your Results', 20, 95);
        
        doc.setFontSize(12);
        doc.text(`Condition: ${classInfo.title}`, 20, 110);
        doc.text(`Severity Level: ${classInfo.severity}`, 20, 120);
        
        // Wrap long text
        const description = doc.splitTextToSize(`Description: ${classInfo.description}`, 170);
        doc.text(description, 20, 130);
        
        // Report Details
        doc.setFontSize(16);
        doc.text('Report Details', 20, 160);
        
        doc.setFontSize(12);
        doc.text(`Analysis Date: ${analysisDate.toLocaleDateString()}`, 20, 175);
        doc.text(`Analysis Time: ${analysisDate.toLocaleTimeString()}`, 20, 185);
        doc.text(`Confidence Level: ${confidenceInfo.level}`, 20, 195);
        
        // Clinical Interpretation
        doc.setFontSize(16);
        doc.text('Clinical Interpretation', 20, 215);
        
        doc.setFontSize(12);
        const recommendation = doc.splitTextToSize(`Recommendation: ${getRecommendation()}`, 170);
        doc.text(recommendation, 20, 230);
        
        // Medical Disclaimer
        doc.setFontSize(14);
        doc.text('Medical Disclaimer', 20, 260);
        
        doc.setFontSize(10);
        const disclaimer = doc.splitTextToSize('This AI analysis is for informational purposes only and should not be used as a substitute for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment decisions.', 170);
        doc.text(disclaimer, 20, 270);
        
        // Footer
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
        doc.text('Retinal Analysis System - AI-Powered Diabetic Retinopathy Detection', 105, 295, { align: 'center' });
        
        // Save the PDF
        doc.save(`Retinal_Analysis_Report_${analysisDate.toISOString().split('T')[0]}.pdf`);
        showNotification('✅ PDF report downloaded successfully!');
      }
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Fallback: Create a simple text file
      const textContent = `
RETINAL ANALYSIS REPORT
AI-Powered Diabetic Retinopathy Detection

ANALYSIS RESULTS
================
Detected Condition: ${prediction.class}
Confidence Level: ${(confidence * 100).toFixed(1)}%

UNDERSTANDING YOUR RESULTS
=========================
Condition: ${classInfo.title}
Severity Level: ${classInfo.severity}
Description: ${classInfo.description}

REPORT DETAILS
=============
Analysis Date: ${analysisDate.toLocaleDateString()}
Analysis Time: ${analysisDate.toLocaleTimeString()}
Confidence Level: ${confidenceInfo.level}

CLINICAL INTERPRETATION
======================
Prediction: ${classInfo.title}
Confidence Score: ${(confidence * 100).toFixed(1)}% - ${confidenceInfo.description}
Medical Description: ${classInfo.description}
Recommendation: ${getRecommendation()}

MEDICAL DISCLAIMER
=================
This AI analysis is for informational purposes only and should not be used as a substitute for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment decisions.

Generated on ${new Date().toLocaleString()}
Retinal Analysis System - AI-Powered Diabetic Retinopathy Detection
      `;
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Retinal_Analysis_Report_${analysisDate.toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('📄 Report downloaded as text file (PDF generation failed)');
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-family: system-ui;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = message;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 3000);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '672px',
      margin: '32px auto',
      overflow: 'hidden',
      borderRadius: '24px',
      background: 'white',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      transform: 'scale(1)',
      transition: 'transform 500ms ease-in-out',
      border: '1px solid #f3f4f6'
    }}>
      <div style={{ background: colors.gradient, height: '8px' }}></div>
      
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ padding: '16px', borderRadius: '9999px', backgroundColor: colors.bg }}>
            <div style={{ width: '40px', height: '40px', fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>👁️</div>
          </div>
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '32px' }}>
          Analysis Complete
        </h3>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Detected Condition</p>
            <div style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              borderRadius: '16px', 
              fontSize: '20px', 
              fontWeight: 'bold', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
              backgroundColor: colors.bg, 
              color: colors.text,
              transform: 'scale(1)',
              transition: 'transform 300ms ease-in-out',
              marginBottom: '16px'
            }}>
              {classInfo.title}
            </div>
            
            {/* Class Information Card */}
            <div style={{
              background: '#e0f2fe',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              padding: '20px',
              margin: '16px 0',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0c4a6e', fontSize: '16px', fontWeight: '600' }}>
                📋 Understanding Your Results
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ color: '#164e63' }}>
                  <strong>Severity Level:</strong> {classInfo.severity}
                </div>
                <div style={{ color: '#164e63', fontSize: '14px', lineHeight: '1.4' }}>
                  <strong>Description:</strong> {classInfo.description}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>Confidence Level</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: colors.primary }}>
                  {(confidence * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{confidenceInfo.level}</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '14px', 
                padding: '8px 16px', 
                borderRadius: '9999px',
                backgroundColor: colors.bg, 
                color: colors.text 
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                {confidenceInfo.description}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
            <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📅</span>
                <span style={{ fontWeight: '600', color: '#374151' }}>Analysis Date</span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '18px' }}>
                {analysisDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  timeZone: 'Asia/Karachi'
                })}
              </p>
            </div>
            
            <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🕐</span>
                <span style={{ fontWeight: '600', color: '#374151' }}>Analysis Time</span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '18px' }}>
                {analysisDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Asia/Karachi'
                })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
            <button
              onClick={generatePDFReport}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                fontWeight: '600',
                fontSize: '18px',
                borderRadius: '16px',
                border: 'none',
                transition: 'all 300ms ease-in-out',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              <span style={{ fontSize: '20px' }}>📥</span>
              Download PDF Report
            </button>
          </div>

          <div style={{ marginTop: '32px', padding: '24px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '20px', marginTop: '4px' }}>🛡️</span>
              <div>
                <h4 style={{ fontWeight: '600', color: '#b45309', marginBottom: '8px' }}>Medical Disclaimer</h4>
                <p style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
                  This AI analysis is for informational purposes only. Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function RetinalAnalysisApp() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (file) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const prediction = await sendImageForPrediction(preview);
      setResult(prediction);
    } catch (error) {
      setError(error.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff, #fae8ff)',
      padding: '32px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      overflow: 'auto'
    }}>
      <div style={{ 
        maxWidth: '896px', 
        width: '100%', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 16px',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px', 
          width: '100%',
          maxWidth: '768px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '12px', 
            background: 'white', 
            borderRadius: '9999px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
            marginBottom: '16px',
            transform: 'scale(1)',
            transition: 'transform 300ms ease-in-out'
          }}>
            <div style={{ width: '40px', height: '40px', color: '#4f46e5', fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁️</div>
          </div>
          <h1 style={{ 
            fontSize: 'clamp(32px, 6vw, 48px)', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #4f46e5, #7c3aed, #db2777)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            marginBottom: '16px',
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            Retinal Analysis
          </h1>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 20px)', 
            color: '#4b5563', 
            maxWidth: '100%', 
            margin: '0 auto', 
            lineHeight: '1.5',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            Upload a retinal image for AI-powered diabetic retinopathy detection. Get instant predictions with detailed confidence scores and downloadable reports.
          </p>
        </div>

        {/* Upload Section */}
        <div style={{ 
          background: 'rgba(255,255,255,0.8)', 
          borderRadius: '24px', 
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
          padding: 'clamp(20px, 4vw, 40px)', 
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '100%',
          maxWidth: '800px',
          boxSizing: 'border-box'
        }}>
          {!preview ? (
            <div
              style={{
                position: 'relative',
                border: `3px dashed ${dragOver ? '#4f46e5' : '#d1d5db'}`,
                borderRadius: '16px',
                padding: 'clamp(32px, 8vw, 64px)',
                textAlign: 'center',
                transition: 'all 300ms ease-in-out',
                cursor: 'pointer',
                background: dragOver ? '#eef2ff' : 'transparent',
                transform: dragOver ? 'scale(1.02)' : 'scale(1)',
                boxShadow: dragOver ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                id="file-upload"
              />
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  margin: '0 auto',
                  width: 'clamp(64px, 12vw, 96px)',
                  height: 'clamp(64px, 12vw, 96px)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: dragOver ? '#e0e7ff' : '#f3f4f6',
                  transition: 'all 300ms ease-in-out'
                }}>
                  <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', color: dragOver ? '#4f46e5' : '#9ca3af', animation: dragOver ? 'bounce 1s infinite' : 'none' }}>⬆️</div>
                </div>
                
                <div>
                  <h3 style={{ 
                    fontSize: 'clamp(20px, 4vw, 28px)', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    marginBottom: '12px',
                    margin: '0 0 12px 0'
                  }}>
                    Drop your retinal image here
                  </h3>
                  <p style={{ 
                    color: '#6b7280', 
                    marginBottom: '24px', 
                    fontSize: 'clamp(14px, 2.5vw, 18px)',
                    margin: '0 0 24px 0'
                  }}>
                    or click to browse files from your device
                  </p>
                  
                  <label
                    htmlFor="file-upload"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 32px)',
                      background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 'clamp(14px, 2.5vw, 18px)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 300ms ease-in-out',
                      border: 'none'
                    }}
                  >
                    <span style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>📁</span>
                    Choose File
                  </label>
                </div>
                
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#9ca3af', margin: '4px 0' }}>
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                  <p style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#9ca3af', margin: '2px 0' }}>
                    Maximum resolution: 4096x4096 pixels
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ overflow: 'hidden', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'white', padding: 'clamp(16px, 3vw, 24px)' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={preview}
                      alt="Retinal Image Preview"
                      style={{ 
                        width: '100%', 
                        maxWidth: '448px', 
                        height: 'auto', 
                        borderRadius: '12px', 
                        transition: 'transform 500ms ease-in-out'
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)', opacity: 0, transition: 'opacity 300ms ease-in-out', borderRadius: '12px' }}></div>
                  </div>
                  
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#4b5563', margin: '4px 0' }}>
                      Image ready for analysis • {image?.name || 'Uploaded image'}
                    </p>
                    <p style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#9ca3af', marginTop: '4px', margin: '4px 0' }}>
                      Size: {image ? (image.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={clearImage}
                  style={{
                    position: 'absolute',
                    top: 'clamp(16px, 3vw, 24px)',
                    right: 'clamp(16px, 3vw, 24px)',
                    padding: '12px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    transition: 'all 200ms ease-in-out',
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleSubmit}
                  disabled={!image || loading}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: 'clamp(16px, 3vw, 20px) clamp(24px, 5vw, 40px)',
                    background: 'linear-gradient(to right, #16a34a, #059669)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 'clamp(16px, 2.5vw, 18px)',
                    borderRadius: '16px',
                    transition: 'all 300ms ease-in-out',
                    cursor: !image || loading ? 'not-allowed' : 'pointer',
                    opacity: !image || loading ? 0.5 : 1,
                    border: 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '24px', height: '24px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '9999px', animation: 'spin 1s linear infinite' }}></div>
                      <span>Analyzing Image...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 'clamp(18px, 3vw, 20px)' }}>👁️</span>
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>

                <button
                  onClick={clearImage}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: 'clamp(16px, 3vw, 20px) clamp(20px, 4vw, 32px)',
                    color: '#4b5563',
                    fontWeight: '500',
                    fontSize: 'clamp(16px, 2.5vw, 18px)',
                    borderRadius: '16px',
                    border: '2px solid #d1d5db',
                    transition: 'all 200ms ease-in-out',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  Upload Different Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#fef2f2', borderRadius: '16px', border: '1px solid #f87171', marginBottom: '32px' }}>
            <p style={{ color: '#991b1b', fontSize: '16px', fontWeight: '500' }}>Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'inline-block', padding: '32px', background: 'rgba(255,255,255,0.9)', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', border: '4px solid #4f46e5', borderTop: '4px solid transparent', borderRadius: '9999px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                <div style={{ position: 'absolute', inset: 0, width: '64px', height: '64px', border: '4px solid #e0e7ff', borderRadius: '9999px', animation: 'pulse 2s infinite', margin: '0 auto' }}></div>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                Analyzing Your Image
              </h3>
              <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '448px', margin: '0 auto', lineHeight: '1.5' }}>
                Our advanced AI is carefully examining the retinal image and preparing your detailed medical report...
              </p>
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#4f46e5', borderRadius: '9999px', animation: 'bounce 0.6s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#4f46e5', borderRadius: '9999px', animation: 'bounce 0.6s infinite 0.1s' }}></div>
                  <div style={{ width: '8px', height: '8px', background: '#4f46e5', borderRadius: '9999px', animation: 'bounce 0.6s infinite 0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && <ResultCard prediction={result} />}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
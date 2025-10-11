import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from '../../context/HistoryContext'; // 1. We need this import
import { predictImage } from '../../services/api';
import ReportModal from '../../components/ReportModal/ReportModal';
import './DashboardPage.css';

const DashboardPage = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);

  const { currentUser } = useAuth();
  // 2. We need to get the function from the context
  const { addPredictionToHistory } = useHistory();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    } else {
      setError('Please select a valid image file (jpeg or png).');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }
    if (!currentUser) {
        setError('You must be logged in to make a prediction.');
        return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
        const token = await currentUser.auth.getIdToken(true);
        const base64Image = await toBase64(selectedFile);
        const predictionData = await predictImage(base64Image, token);
        
        // 3. This is the complete logic:
        setResult(predictionData); // This updates the Dashboard
        addPredictionToHistory(predictionData); // This updates the History page

    } catch (err) {
      setError('An error occurred during prediction. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return (
    // Your JSX is perfect and does not need any changes.
    // ... all the JSX from your working version ...
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome, {currentUser?.profile?.name}</p>
        </div>

        <div className="dashboard-main">
          <div className="upload-card">
            <h2>Upload Fundus Image</h2>
            <p>Select a PNG or JPG image to begin the analysis.</p>
            <div className="uploader-section">
              <input 
                type="file" 
                id="file-upload" 
                accept="image/png, image/jpeg"
                onChange={handleFileChange} 
              />
              <label htmlFor="file-upload" className="custom-file-upload">
                {selectedFile ? selectedFile.name : 'Choose Image'}
              </label>
            </div>
            {preview && (
              <div className="image-preview-container">
                <img src={preview} alt="Selected eye" className="image-preview"/>
              </div>
            )}
            <button 
              onClick={handlePredict} 
              className="predict-button"
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          <div className="result-display-card">
            <h2>Analysis Results</h2>
            {isLoading && <div className="loader"></div>}
            {error && <p className="error-message">{error}</p>}
            
            {result && !isLoading && (
              <div className="result-summary">
                <p>Diagnosis:</p>
                <h3 className="result-class">{result?.class || 'N/A'}</h3>
                <p className="result-confidence">
                  Confidence: {result?.confidence ? `${(result.confidence * 100).toFixed(2)}%` : 'N/A'}
                </p>
                <button 
                  onClick={() => setIsReportVisible(true)} 
                  className="view-report-button"
                >
                  View Full Report
                </button>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="placeholder-text">
                <p>Your prediction results will appear here after analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isReportVisible && (
        <ReportModal 
          user={currentUser} 
          result={result} 
          onClose={() => setIsReportVisible(false)} 
        />
      )}
    </>
  );
};

export default DashboardPage;
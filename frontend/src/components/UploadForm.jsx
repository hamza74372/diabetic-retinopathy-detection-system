import React, { useState } from 'react';
import { sendImageForPrediction } from '../services/api'; // Will use later for real API
import ResultCard from './ResultCard'; // Optional: you can replace with inline display

export default function UploadForm() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Predict button click
 const handleSubmit = async () => {
  if (!image) return;

  // Call backend API
  const prediction = await sendImageForPrediction(preview);
  setResult(prediction);
};


  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Retinal Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      {preview && (
        <div style={{ marginTop: '10px' }}>
          <img src={preview} alt="preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSubmit}>Predict</button>
      </div>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', maxWidth: '400px' }}>
          <h3>Prediction Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

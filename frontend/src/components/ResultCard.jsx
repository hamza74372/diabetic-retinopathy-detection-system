import React from 'react';

export default function ResultCard({ prediction }) {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', maxWidth: '400px' }}>
      <h3>Prediction Result:</h3>
      <pre>{JSON.stringify(prediction, null, 2)}</pre>
    </div>
  );
}

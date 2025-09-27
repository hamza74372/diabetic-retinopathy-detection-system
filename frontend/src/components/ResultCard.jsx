import React from "react";
import "./ResultCard.css";

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="result-card">
      <h3>Prediction Result</h3>

      {result.error ? (
        <p className="error">❌ {result.error}</p>
      ) : (
        <>
          <p className="prediction">
            <strong>Class:</strong> {result.class || "Unknown"}
          </p>
          {result.probability !== undefined && (
            <p className="confidence">
              <strong>Confidence:</strong> {(result.probability * 100).toFixed(2)}%
            </p>
          )}
        </>
      )}
    </div>
  );
}

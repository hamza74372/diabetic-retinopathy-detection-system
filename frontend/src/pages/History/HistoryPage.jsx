import React, { useEffect, useCallback } from 'react';
import { useHistory } from '../../context/HistoryContext';
import './HistoryPage.css';

const HistoryPage = () => {
  const { history, isLoading, error, fetchHistory } = useHistory();

  // On the first load, trigger the fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="history-container loading-container">
        <div className="loader"></div>
        <p>Loading History...</p>
      </div>
    );
  }

  // --- IMPROVED ERROR DISPLAY WITH RETRY BUTTON ---
  if (error) {
    return (
      <div className="history-container error-container">
        <p>{error}</p>
        <button onClick={fetchHistory} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1>Prediction History</h1>
      {history.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Diagnosis</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td>{item.class}</td>
                <td>{(item.confidence * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-history">
          <p>You have no past predictions.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
import React, { createContext, useState, useContext, useCallback } from 'react';
import { getHistory } from '../services/api';
import { useAuth } from './AuthContext';

const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFetched, setHasFetched] = useState(false); // Track if we've fetched already
  const { currentUser } = useAuth();

  const fetchHistory = useCallback(async () => {
    // Only fetch if we have a user and haven't fetched before
    if (!currentUser || hasFetched) return;

    setIsLoading(true);
    setError('');
    try {
      const token = await currentUser.auth.getIdToken(true);
      const data = await getHistory(token);
      setHistory(data);
      setHasFetched(true); // Mark as fetched
    } catch (err) {
      setError('Failed to load prediction history.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, hasFetched]);

  // Function to add a new prediction to the start of the existing history array
  const addPredictionToHistory = (newPrediction) => {
    setHistory(prevHistory => [newPrediction, ...prevHistory]);
  };

  const value = {
    history,
    isLoading,
    error,
    fetchHistory,
    addPredictionToHistory
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

// Custom hook to easily use the context
export const useHistory = () => {
  return useContext(HistoryContext);
};
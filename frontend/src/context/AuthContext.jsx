import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase'; // db is now the Realtime Database
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async ({ name, age, gender, email, password }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await set(ref(db, 'users/' + user.uid), {
      uid: user.uid,
      name,
      age,
      gender,
      email
    });
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

 // src/context/AuthContext.jsx

// ... other imports ...

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // If a user is authenticated, fetch their profile
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        // ** THE FIX **
        // Create a nested object to preserve the original 'user' object and its methods
        setCurrentUser({
          auth: user,               // The original Firebase user object with getIdToken()
          profile: snapshot.val()   // Your profile data (name, age, gender)
        });
      } else {
        // If no profile, just set the auth part
        setCurrentUser({ auth: user, profile: null });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    register,
    login,
    logout,
  };

  // Important: Don't render the rest of the app until the user's status is confirmed
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
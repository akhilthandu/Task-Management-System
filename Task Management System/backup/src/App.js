// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './Login';
import './App.css';
import Register from './Register';
import Dashboard from './Dashboard';
import ProjectPage from './ProjectPage';
import MemberPage from './MemberPage';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Using state for reactivity

  const handleLogin = () => {
    setIsLoggedIn(true); // Update state to true when the user logs in
  };

  const handleRegister = () => {
    setIsLoggedIn(true); // Update state to true when the user logs in
  };

  return (
    <Router>
      <div style = {divstyle}>
        <header style={headerStyle}>
          <h1 style={{ margin: 0 }}>Project Management</h1>
          <nav style={navStyle}>
            {isLoggedIn ? (
              <>
                  <button style={buttonStyle}>Home</button>
                  <button style={buttonStyle}>Logout</button>
                  <button style={buttonStyle}>Notifications</button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button style={buttonStyle}>Login</button>
                </Link>
                <Link to="/register">
                  <button style={buttonStyle}>Register</button>
                </Link>
              </>
            )}
          </nav>
        </header>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projectpage" element={<ProjectPage />} />
          <Route path="/member" element={<MemberPage />} />
        </Routes>
      </div>
    </Router>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#1A4D2E',
  padding: '10px 20px',
  color: '#E8DFCA',
};

const divstyle = {
  fontFamily: 'product sans',
}

const navStyle = {
  display: 'flex',
  gap: '10px',
};

const buttonStyle = {
  backgroundColor: '#4F6F52',
  color: '#E8DFCA',
  border: 'none',
  padding: '10px 15px',
  cursor: 'pointer',
  borderRadius: '5px',
};

export default App;

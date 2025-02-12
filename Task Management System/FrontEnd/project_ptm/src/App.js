// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './Login';
import './App.css';
import Register from './Register';
import { useNavigate } from 'react-router-dom'; 
import Dashboard from './Dashboard';
import ProjectPage from './ProjectPage';
import MemberPage from './MemberPage';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const App = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId')); // Using state for reactivity
  const [loading, setLoading] = useState(true); // New loading state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // New state for Settings dropdown
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false); // State for Change Password popup
  const [changePasswordForm, setChangePasswordForm] = useState({
    emailid: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
 

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Check for userId in local storage and update isLoggedIn state
    const userId = localStorage.getItem('userId');
    console.log("User ID in local storage:", userId);
    setIsLoggedIn(!!userId); // True if userId exists, false if not
    setLoading(false); // Set loading to false after checking local storage
  }, []);


  const fetchNotifications = async () => {
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('id', userId);
      const response = await fetch(`${backendUrl}/api/projects/fetch_notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });

      const data = await response.json();
      const sortedNotifications = data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handlePasswordChange = async () => {
    const { emailid, oldPassword, newPassword } = changePasswordForm;

    // Check if passwords match
    if (newPassword !== changePasswordForm.confirmPassword) {
      setAlertMessage("Passwords do not match. Please try again.");
      //alert("Passwords do not match. Please try again.");
      return;
    }

    const encodedData = new URLSearchParams();
    encodedData.append('id', userId);
    encodedData.append('email', emailid);
    encodedData.append('old_pass', oldPassword);
    encodedData.append('new_pass', newPassword);
    const response = await fetch(`${backendUrl}/api/auth/change_pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodedData.toString(),
    });

    const result = await response.json();
    if (response.ok && result.msg === "Success") {
      alert("Password change successful. You will be logged out.");
      setIsChangePasswordOpen(false);
      setTimeout(() => handleLogout(), 1000);
    } else {
      setAlertMessage("Invalid email or password. Please try again.");
      //alert("Invalid email or password. Please try again.");
      setChangePasswordForm({ ...changePasswordForm, oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) fetchNotifications();
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    console.log(isSettingsOpen);
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordOpen(!isChangePasswordOpen);
    //setIsSettingsOpen(!setIsSettingsOpen); // Close Settings dropdown when opening the popup
  };

  const handleLogin = () => {
    setIsLoggedIn(true); // Update state to true when the user logs in
  };

  const handleRegister = () => {
    setIsLoggedIn(true); // Update state to true when the user logs in
  };

  const handleLogout = () => {
    localStorage.removeItem('userId'); // Remove userId from local storage
    setIsLoggedIn(false); // Update isLoggedIn state
    setIsSettingsOpen(false);
  };

  return (
    <Router>
      <div style = {divstyle}>
        <header style={headerStyle}>
          <h1 className='app-name'>Project Management</h1>
          <nav style={navStyle}>
            {isLoggedIn ? (
              <>
                  <Link to = "/dashboard">
                    <button style={buttonStyle}>Home</button>
                  </Link>
                  <button onClick={toggleNotifications} style={buttonStyle}>Notifications</button>
                  <button onClick={toggleSettings} style={buttonStyle}>Settings</button>
                  
                  {isNotificationsOpen && (
                    <div className="notifications-dropdown">
                      {notifications.length ? (
                        <ul>
                          {notifications.map((note) => (
                            <li key={note._id}>
                              <strong>{note.text}</strong>
                              <br />
                              <span>
                              {`${new Date(note.datetime).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })} at ${new Date(note.datetime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='nonoti'>No notifications</p>
                      )}
                    </div>
                  )}

                  {isSettingsOpen && (
                    <div className="settings-dropdown">
                      <button onClick={handleLogout} className='dropdownButtonStyle'>Logout</button>
                      <button onClick={handleChangePasswordClick} className='dropdownButtonStyle'>Change Password</button>
                    </div>
                  )}

                  {isChangePasswordOpen && (
                  <div className='popup-overlay'>
                    <div className="change-password-popup">
                      <h2>Change Password</h2>
                      <input type="email" placeholder="Email" value={changePasswordForm.emailid} onChange={(e) => setChangePasswordForm({ ...changePasswordForm, emailid: e.target.value })} required />
                      <input type="password" placeholder="Previous Password" value={changePasswordForm.oldPassword} onChange={(e) => setChangePasswordForm({ ...changePasswordForm, oldPassword: e.target.value })} required />
                      <input type="password" placeholder="New Password" value={changePasswordForm.newPassword} onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })} required />
                      <input type="password" placeholder="Confirm New Password" value={changePasswordForm.confirmPassword} onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })} required />
                      
                      {alertMessage && <div className="custom-alert">{alertMessage}</div>}
                      
                      <button onClick={handlePasswordChange}>Change Password and Logout</button>
                      <button onClick={handleChangePasswordClick}>Cancel</button>
                    </div>
                  </div>
                  )}

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
        {!loading && (
          <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/projectpage" element={isLoggedIn ? <ProjectPage /> : <Navigate to="/login" />} />
          <Route path="/member" element={isLoggedIn ? <MemberPage /> : <Navigate to="/login" />} />
        </Routes>
        )}
      </div>
    </Router>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(to right, rgba(26, 77, 46, 1), rgba(15, 40, 20, 1)',
  //backgroundColor: '#1A4D2E',
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

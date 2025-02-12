// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'

// Import your local icons
import eyeIcon from './images/eye-icon.png'; // Adjust the path as needed
import eyeSlashIcon from './images/eye-icon-slash.png';

//url: http://192.168.237.63:1337/api/auth/login
//     http://192.168.237.63:1337/api/auth/register
//     http://192.168.237.63:1337/api/projects

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [alertMessage, setAlertMessage] = useState(''); // Alert message state
  const navigate = useNavigate(); // Updated to useNavigate
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false); // State for forgot password popup
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false); // State for new password popup
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
    fullName: '',
  });
  const [newPasswordForm, setNewPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  

  // Handle forgot password form submission
  const handleForgotPasswordSubmit = async () => {
    const { email, fullName } = forgotPasswordForm;
    try {
      const encodedData = new URLSearchParams();
      encodedData.append('email', email);
      encodedData.append('name', fullName);

      const response = await fetch(`${backendUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      const result = await response.json();

      if (result.msg === 'Fail') {
        setAlertMessage("Sorry, we couldn't find a match for the email and full name.");
      } else if (result.msg === 'Sucess') {
        setIsForgotPasswordOpen(false); // Close the first popup
        setIsNewPasswordOpen(true); // Open the second popup for new password
      }
    } catch (error) {
      console.error("Error with forgot password:", error);
      setAlertMessage("An error occurred. Please try again.");
    }
  };

   // Handle new password form submission
   const handleNewPasswordSubmit = async () => {
    const { email } = forgotPasswordForm; // Get email from the previous form
    const { newPassword, confirmPassword } = newPasswordForm;

    if (newPassword !== confirmPassword) {
      setAlertMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      const encodedData = new URLSearchParams();
      encodedData.append('email', email);
      encodedData.append('new_pass', newPassword);

      const response = await fetch(`${backendUrl}/api/auth/forgot_pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData.toString(),
      });

      const result = await response.json();

      if (result.msg === 'Success') {
        alert("Password recovery successful! You will be redirected to the login page.");
        setIsNewPasswordOpen(false);
        //navigate('/login'); // Navigate to login after a short delay
      } else {
        setAlertMessage("An error occurred while resetting your password. Please try again.");
      }
    } catch (error) {
      console.error("Error with password reset:", error);
      setAlertMessage("An error occurred. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
    const encodedData = new URLSearchParams();
    encodedData.append('email', username);
    encodedData.append('pass', password);
    // Add your login logic here
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodedData.toString(),
      });
      
      // Log the response status to debug any network/server issues
      console.log('Response Status:', response.status);

      // Check if the response is successful (status code 200-299)
      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json(); // Attempt to parse JSON response
        } catch (error) {
            console.error('Failed to parse error response as JSON:', error);
            alert('2: An error occurred. Please try again.');
            return;
        }
    
        if (response.status === 400 && errorData.msg === "Invalid credentials") {
          setAlertMessage('Invalid credentials. Please try again.');
          setTimeout(() => setAlertMessage(''), 3000);
            return;
        } else {
            console.error('Error response from server:', errorData || 'No additional error info');
            alert('1: An error occurred. Please try again.');
            return;
        }
      }

      const data = await response.json(); // Parse response JSON
      console.log('Response Data:', data);

      if (data.userId) {
          // If JWT token is returned, authenticate the user
          localStorage.setItem('userId', data.userId);  // Store the token
          onLogin();  // Update the login state in the parent component
          navigate('/dashboard');  // Redirect to the dashboard page
      } else {
          alert('4:An error occurred. Please try again.');
      }} catch (error) {
        // Handle network or other errors
        console.error('Error during login:', error);
        alert('3:An error occurred. Please try again.');
    }
    // On successful login, redirect to the dashboard
    //onLogin(); // Call the function to update the login state in App.js
    //navigate('/dashboard'); // Updated to use navigate
  };

  return (
    <div style={containerStyle}>
      <div className='login-container'>
      <h2 className='login-text'>Login</h2>
       
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Email Id</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
            placeholder="Enter your email"
          />
        </div>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, paddingRight: '40px' }}
            placeholder="Enter your password"
          />
          <img
            src={showPassword ? eyeSlashIcon : eyeIcon}
            alt="Toggle Password Visibility"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              width: '20px',
              height: '20px',
            }}
          />
          </div>
        </div>
        {/* Alert box */}
       {alertMessage && <div className="alert-box">{alertMessage}</div>}
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <button className='forgotstyle' onClick={() => setIsForgotPasswordOpen(true)}>Forgot Password</button>

      {/* Forgot Password Popup */}
      {isForgotPasswordOpen && (
        <div className="popup-overlay">
          <div className="forgot-password-popup">
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Email"
              value={forgotPasswordForm.email}
              onChange={(e) =>
                setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={forgotPasswordForm.fullName}
              onChange={(e) =>
                setForgotPasswordForm({ ...forgotPasswordForm, fullName: e.target.value })
              }
              required
            />
            {alertMessage && <div className="alert-message">{alertMessage}</div>}
            <button onClick={handleForgotPasswordSubmit}>Submit</button>
            <button onClick={() => setIsForgotPasswordOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* New Password Popup */}
      {isNewPasswordOpen && (
        <div className="popup-overlay">
          <div className="forgot-password-popup">
            <h2>Reset Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPasswordForm.newPassword}
              onChange={(e) =>
                setNewPasswordForm({ ...newPasswordForm, newPassword: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={newPasswordForm.confirmPassword}
              onChange={(e) =>
                setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })
              }
              required
            />
            {alertMessage && <div className="alert-message">{alertMessage}</div>}
            <button onClick={handleNewPasswordSubmit}>Submit</button>
            <button onClick={() => setIsNewPasswordOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <p style={linkStyle}>
        Don't have an account? <a href="/register">Register</a>
      </p>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundImage: 'radial-gradient(circle, rgba(164, 181, 152, 0.9), rgba(226, 218, 208, 0.9))'

  //backgroundColor: '#F5EFE6',
};

const inputContainerStyle = {
  marginBottom: '15px',
  width: '300px',
};

const labelStyle = {
  marginBottom: '5px',
  fontWeight: 'bold',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  backgroundColor: '#4F6F52',
  color: '#E8DFCA',
  border: 'none',
  padding: '4px 10px',
  cursor: 'pointer',
  borderRadius: '5px',
};

const linkStyle = {
  marginTop: '10px',
};

export default Login;

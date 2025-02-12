// src/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import eyeIcon from './images/eye-icon.png'; // Adjust the path as needed
import eyeSlashIcon from './images/eye-icon-slash.png';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate(); // Updated to useNavigate

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Validate password strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setPasswordError("Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.");
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    // Check if confirm password matches the original password
    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordError) {
      setPassword('');
      setAlertMessage('Please enter a Password that must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.');
      return;
    }

    if(confirmPasswordError){
      setPassword('');
      setConfirmPassword('');
      setAlertMessage("Oops! It looks like the passwords don’t quite match. Could you double-check both fields?");
      return;
    }

    try{
      const encodedData = new URLSearchParams();
      encodedData.append('email', email);
      encodedData.append('pass', password);
      encodedData.append('name', username)
      // Add your register logic here
        const response = await fetch(`${backendUrl}/api/auth/register`, {
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
              alert('User already exists');
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
            onRegister();  // Update the login state in the parent component
            navigate('/');  // Redirect to the dashboard page
        } else {
            alert('4:An error occurred. Please try again.');
        }} catch (error) {
          // Handle network or other errors
          console.error('Error during login:', error);
          alert('3:An error occurred. Please try again.');
      }

    // Handle registration logic here
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundImage: 'radial-gradient(circle, rgba(164, 181, 152, 0.9), rgba(226, 218, 208, 0.9))'

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

  return (
    <div style={containerStyle}>
      <div className='register-container'>
      <h2 className='register-text'>Register</h2>
      <form onSubmit={handleRegister}>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Full Name:</label>
          <input
            type="text"
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Full Name"
            required
          />
        </div>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className='passwords-in-row'>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Password:</label>
          <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
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

        <div style={inputContainerStyle}>
            <label style={labelStyle}>Confirm Password:</label>
            <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              style={{ ...inputStyle, paddingRight: '40px' }}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              required
            />
            <img
            src={showConfirmPassword ? eyeSlashIcon : eyeIcon}
            alt="Toggle Confirm Password Visibility"
            onClick={toggleConfirmPasswordVisibility}
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
          </div>

          <div className='errors-alerts'>
            {passwordError && <div className="custom-alert">{passwordError}</div>}
            {confirmPasswordError && <div className="custom-alert">{confirmPasswordError}</div>}
            {alertMessage && <div className="custom-alert">{alertMessage}</div>}
          </div>
          
        
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
      <div style={linkStyle}>
        Already have an account? <a href="/login">Login here</a>
      </div>
      </div>
    </div>
  );
};

export default Register;

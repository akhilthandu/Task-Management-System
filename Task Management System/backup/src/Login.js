// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//url: http://192.168.237.63:1337/api/auth/login
//     http://192.168.237.63:1337/api/auth/register
//     http://192.168.237.63:1337/api/projects

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Updated to useNavigate

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
            alert('Invalid credentials. Please try again.');
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
      <h2>Login</h2>
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p style={linkStyle}>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#F5EFE6',
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
  padding: '10px 15px',
  cursor: 'pointer',
  borderRadius: '5px',
  width: '100%',
};

const linkStyle = {
  marginTop: '10px',
};

export default Login;

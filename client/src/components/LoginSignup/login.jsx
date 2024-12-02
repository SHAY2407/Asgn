import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted', { email, password, role });

    axios.post('http://localhost:3001/login', { email, password, role })
      .then(result => {
        console.log(result.data);
        if (result.data.message === 'Success') {
          if (result.data.role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (result.data.role === 'student') {
            navigate('/student-dashboard');
          }
        } else {
          alert(result.data.message); // Display error message
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="signup-container">
      <div className="left-panel">
        <div className="branding">
          <h1 className="brand-title">Asgn.</h1>
          <p className="brand-subtitle">
            Precision in Education,<br />
            Personalization in Practice
          </p>
        </div>
      </div>
      <div className="right-panel">
        <div className="form-container">
          <h2 className="form-title">Login</h2>
          <p className="form-subtitle">Log in to your account</p>
          
          {/* Role Selection */}
          <div className="role-selection">
            <button
              type="button"
              className={`role-button ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-button ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => setRole('teacher')}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <button
              type="submit"
              className="submit-button"
            >
              Login
            </button>
          </form>
          <p className="signin-prompt">
            Don't have an account?{' '}
            <Link to="/signup" className="signin-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

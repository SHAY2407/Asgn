import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './signup.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); 
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign up submitted', { username, email, password, role });

    axios.post('http://localhost:3001/register', { username, email, password,  role})
      .then(result => {
        console.log(result);
        navigate('/login');
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
          <h2 className="form-title">Sign Up</h2>
          <p className="form-subtitle">Let's sign up quickly to get started.</p>

          {/* Role Selection */}
          <div className="role-selection">
            <button
              type="button"
              className={`role-button ${role === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleSelection('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-button ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => handleRoleSelection('teacher')}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username" className="input-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>
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
              Sign Up
            </button>
          </form>
          <p className="signin-prompt">
            Already have an account?{' '}
            <Link to="/login" className="signin-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

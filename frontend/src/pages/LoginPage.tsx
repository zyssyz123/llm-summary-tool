import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { authApi } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(loginStart());
    
    try {
      // Use API to perform actual login request
      const response = await authApi.login(email, password);
      const token = response.data.access_token;
      
      // Save token and send getMe request
      localStorage.setItem('token', token);
      
      try {
        // Get user info
        const userResponse = await authApi.getMe();
        const userData = userResponse.data;
        
        // Use Redux action to save user info and token
        dispatch(loginSuccess({
          user: {
            id: userData.id,
            email: userData.email,
            username: userData.username,
          },
          token: token
        }));
        
        alert('Login successful.');
        navigate('/chat');
      } catch (userErr) {
        console.error("Failed to get user info:", userErr);
        dispatch(loginFailure("Successfully logged in but failed to get user info"));
        alert("Login succeeded but failed to get your account information. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Invalid credentials';
      dispatch(loginFailure(errorMessage));
      alert(`Login failed: ${errorMessage}`);
    }
  };

  const formContainerStyle: React.CSSProperties = {
    maxWidth: '28rem',
    margin: '0 auto',
    padding: '3rem 1rem',
  };

  const cardStyle: React.CSSProperties = {
    padding: '2rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backgroundColor: 'white',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    borderRadius: '0.25rem',
    fontSize: '1rem',
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#E53E3E',
  };

  const errorMessageStyle: React.CSSProperties = {
    color: '#E53E3E',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  };

  const buttonLoadingStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.7,
    cursor: 'not-allowed',
  };

  return (
    <div style={formContainerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Login</h1>
          
          {error && (
            <p style={{ color: '#E53E3E', textAlign: 'center', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  style={emailError ? errorInputStyle : inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <div style={errorMessageStyle}>{emailError}</div>
                )}
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Password</label>
                <input
                  style={passwordError ? errorInputStyle : inputStyle}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <div style={errorMessageStyle}>{passwordError}</div>
                )}
              </div>
              
              <button
                type="submit"
                style={loading ? buttonLoadingStyle : buttonStyle}
                disabled={loading}
              >
                {loading ? 'Logging in' : 'Login'}
              </button>
            </div>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3182CE', textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
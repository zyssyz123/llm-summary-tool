import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { registerStart, registerSuccess, registerFailure } from '../features/auth/authSlice';
import { authApi } from '../services/api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validateForm = () => {
    let isValid = true;
    
    if (!username) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    } else {
      setUsernameError('');
    }
    
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
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(registerStart());
    
    try {
      // 使用API进行实际注册请求
      const response = await authApi.register(username, email, password);
      
      // 注册成功后自动登录
      const loginResponse = await authApi.login(email, password);
      
      dispatch(registerSuccess({
        user: {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
        },
        token: loginResponse.data.access_token
      }));
      
      alert('Account created successfully!');
      
      navigate('/chat');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      dispatch(registerFailure(errorMessage));
      
      alert(`Registration failed: ${errorMessage}`);
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
          <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Register</h1>
          
          {error && (
            <p style={{ color: '#E53E3E', textAlign: 'center', marginTop: '0.5rem' }}>
              {error}
            </p>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Username</label>
                <input
                  style={usernameError ? errorInputStyle : inputStyle}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {usernameError && (
                  <div style={errorMessageStyle}>{usernameError}</div>
                )}
              </div>
              
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
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  style={confirmPasswordError ? errorInputStyle : inputStyle}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPasswordError && (
                  <div style={errorMessageStyle}>{confirmPasswordError}</div>
                )}
              </div>
              
              <button
                type="submit"
                style={loading ? buttonLoadingStyle : buttonStyle}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Already have an account?{' '}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: '#3182CE', textDecoration: 'none' }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
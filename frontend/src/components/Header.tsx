import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import { logout } from '../features/auth/authSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // 模拟暗色/亮色模式切换
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleColorMode = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header style={{ 
      backgroundColor: isDarkMode ? '#1A202C' : 'white', 
      padding: '8px 16px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)' 
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <h1 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: 0,
            color: isDarkMode ? 'white' : 'black'
          }}
          onClick={() => navigate('/')}
        >
          AI Content Assistant
        </h1>
        
        <div style={{ display: 'flex' }}>
          <button 
            style={{ 
              marginRight: '8px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7',
              color: isDarkMode ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'medium'
            }} 
            onClick={toggleColorMode}
          >
            {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                style={{ 
                  marginRight: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#3182CE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}
                onClick={() => navigate('/chat')}
              >
                New Chat
              </button>
              <button 
                style={{ 
                  marginRight: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: isDarkMode ? 'white' : '#3182CE',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}
                onClick={() => navigate('/history')}
              >
                History
              </button>
              <button 
                style={{ 
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#3182CE',
                  border: '1px solid #3182CE',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                style={{ 
                  marginRight: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#3182CE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                style={{ 
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#3182CE',
                  border: '1px solid #3182CE',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'medium'
                }}
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 
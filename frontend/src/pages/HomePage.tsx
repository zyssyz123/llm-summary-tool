import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#F7FAFC',
      minHeight: 'calc(100vh - 80px)',
      paddingTop: '40px',
      paddingBottom: '40px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 16px' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>
            AI Content Assistant
          </h1>
          <p style={{ fontSize: '18px', maxWidth: '800px', marginTop: '16px' }}>
            Upload text, PDFs, or URLs and get AI-powered summaries, key points, and insights. 
            Ask questions about your content and receive helpful answers.
          </p>
          
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button 
                style={{
                  backgroundColor: '#3182CE',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  color: '#3182CE',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: '1px solid #3182CE',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
          ) : (
            <button 
              style={{
                backgroundColor: '#3182CE',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginTop: '24px'
              }}
              onClick={() => navigate('/chat')}
            >
              Start a New Chat
            </button>
          )}
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '32px', 
            marginTop: '48px', 
            width: '100%',
            justifyContent: 'center' 
          }}>
            <Feature 
              title="Text & PDF Support" 
              description="Upload any PDF document or paste text directly to extract insights and summaries."
              emoji="📄"
            />
            <Feature 
              title="Interactive Q&A" 
              description="Ask follow-up questions and get detailed answers based on your content."
              emoji="💬"
            />
            <Feature 
              title="Key Point Extraction" 
              description="Automatically identify and highlight the most important points from your content."
              emoji="🔑"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureProps {
  title: string;
  description: string;
  emoji: string;
}

const Feature: React.FC<FeatureProps> = ({ title, description, emoji }) => {
  return (
    <div style={{ 
      padding: '24px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)', 
      borderRadius: '8px', 
      backgroundColor: 'white', 
      maxWidth: '350px', 
      height: '100%' 
    }}>
      <div style={{ fontSize: '36px', marginBottom: '16px' }}>{emoji}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        {title}
      </h3>
      <p>{description}</p>
    </div>
  );
};

export default HomePage; 
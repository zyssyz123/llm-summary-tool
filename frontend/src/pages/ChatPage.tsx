import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../features/store';
import { addMessage, startNewChat, loadChatsStart, loadChatsSuccess, loadChatsFailure } from '../features/chat/chatSlice';
import { Message } from '../features/chat/chatSlice';
import { chatApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Custom icon components
const SendIcon = () => <span>📤</span>;
const FileIcon = () => <span>📎</span>;
const LinkIcon = () => <span>🔗</span>;

const formatAIResponse = (data: any): string => {
  let formattedResponse = '';
  
  // 添加摘要
  if (data.summary) {
    formattedResponse += `## 摘要\n${data.summary}\n\n`;
  }
  
  // 添加要点
  if (data.key_points && Array.isArray(data.key_points)) {
    formattedResponse += `## 重要要点\n`;
    data.key_points.forEach((point: string, index: number) => {
      formattedResponse += `${index + 1}. ${point}\n`;
    });
  }
  
  // 如果有response字段（可能用于其他API响应）
  if (data.response && !data.summary) {
    formattedResponse += data.response;
  }
  
  return formattedResponse.trim() || 'No content available';
};

const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 加载用户的聊天历史
    const loadChats = async () => {
      dispatch(loadChatsStart());
      try {
        const response = await chatApi.getChats();
        dispatch(loadChatsSuccess(response.data));
      } catch (err) {
        dispatch(loadChatsFailure('Failed to load chats'));
      }
    };

    loadChats();
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    // If no chat exists, create a new one
    if (!currentChat) {
      createNewChat();
    }
  }, [dispatch, currentChat]);

  // 创建新聊天
  const createNewChat = async () => {
    try {
      const response = await chatApi.createChat('New Chat');
      dispatch(startNewChat(response.data));
    } catch (err) {
      alert('Failed to create a new chat');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        alert('Invalid file type. Please upload a PDF file');
        return;
      }
      
      setFile(selectedFile);
      
      // Auto-send when file is selected
      handleFileSubmit(selectedFile);
    }
  };

  const handleFileSubmit = async (selectedFile: File) => {
    if (!currentChat) return;
    
    setIsProcessing(true);
    
    // Add user message about the file
    const userMessage: Message = {
      id: uuidv4(),
      content: `I uploaded a PDF: ${selectedFile.name}`,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    try {
      // 发送用户消息
      await chatApi.sendMessage(currentChat.id, userMessage.content);
      dispatch(addMessage(userMessage));
      
      // 处理PDF文件
      const response = await chatApi.processPdf(selectedFile);
      
      // 添加AI回复
      const aiMessage: Message = {
        id: uuidv4(),
        content: formatAIResponse(response.data),
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      dispatch(addMessage(aiMessage));
    } catch (err) {
      alert('Failed to process PDF file');
    } finally {
      setFile(null);
      setIsProcessing(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = async () => {
    if (!currentChat || !url) {
      alert('URL required. Please enter a valid URL');
      return;
    }
    
    setIsProcessing(true);
    
    // Add user message about the URL
    const userMessage: Message = {
      id: uuidv4(),
      content: `I shared this URL: ${url}`,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    try {
      // 发送用户消息
      await chatApi.sendMessage(currentChat.id, userMessage.content);
      dispatch(addMessage(userMessage));
      
      // 处理URL
      const response = await chatApi.processUrl(url);
      
      // 添加AI回复
      const aiMessage: Message = {
        id: uuidv4(),
        content: formatAIResponse(response.data),
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      dispatch(addMessage(aiMessage));
    } catch (err) {
      alert('Failed to process URL');
    } finally {
      setUrl('');
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!currentChat || !message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    try {
      // 发送用户消息
      await chatApi.sendMessage(currentChat.id, userMessage.content);
      dispatch(addMessage(userMessage));
      setMessage('');
      setIsProcessing(true);
      
      // 处理文本
      const response = await chatApi.processText(userMessage.content);
      console.log(response)
      // 添加AI回复
      const aiMessage: Message = {
        id: uuidv4(),
        content: formatAIResponse(response.data),
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      dispatch(addMessage(aiMessage));
    } catch (err) {
      alert('Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (activeTab) {
      case 0:
        handleTextSubmit();
        break;
      case 1:
        handleUrlSubmit();
        break;
      default:
        break;
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    height: 'calc(100vh - 80px)',
    position: 'relative',
    margin: '0 auto',
    padding: '0 16px',
  };

  const flexColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px 0',
  };

  const messageContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '16px',
  };

  const getUserMessageStyle = (isUser: boolean): React.CSSProperties => ({
    backgroundColor: isUser ? '#ebf8ff' : '#f8f9fa',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    maxWidth: '80%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    marginLeft: isUser ? 'auto' : 0,
  });

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    width: '100%',
    backgroundColor: '#E2E8F0',
    margin: '8px 0',
  };

  const tabStyle: React.CSSProperties = {
    padding: '8px 16px',
    cursor: 'pointer',
    textAlign: 'center',
    borderBottom: '2px solid transparent',
    flex: 1,
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    borderBottom: '2px solid #3182CE',
    fontWeight: 'bold',
  };

  const tabListStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E2E8F0',
    marginBottom: '16px',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    resize: 'none',
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '4px',
    marginRight: '8px',
    height: '100px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '4px',
    marginRight: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#3182CE',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const fullWidthButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const flexRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const boldTextStyle: React.CSSProperties = {
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <div style={flexColumnStyle}>
        <div style={messageContainerStyle}>
          {currentChat?.messages.map((msg) => (
            <div 
              key={msg.id}
              style={getUserMessageStyle(msg.role === 'user')}
            >
              <div style={boldTextStyle}>{msg.role === 'user' ? 'You' : 'AI'}</div>
              <div>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={dividerStyle} />
        
        <div>
          <div>
            <div style={tabListStyle}>
              <div 
                style={activeTab === 0 ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab(0)}
              >
                Text
              </div>
              <div 
                style={activeTab === 1 ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab(1)}
              >
                URL
              </div>
              <div 
                style={activeTab === 2 ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab(2)}
              >
                Upload
              </div>
            </div>
            
            <div>
              {activeTab === 0 && (
                <div style={{ padding: '8px 0' }}>
                  <form onSubmit={handleSubmit}>
                    <div style={flexRowStyle}>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        style={textareaStyle}
                      />
                      <button
                        type="button"
                        onClick={() => handleTextSubmit()}
                        disabled={isProcessing}
                        style={isProcessing ? disabledButtonStyle : buttonStyle}
                        aria-label="Send message"
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 1 && (
                <div style={{ padding: '8px 0' }}>
                  <form onSubmit={handleSubmit}>
                    <div style={flexRowStyle}>
                      <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL (e.g., Medium article, blog post)"
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => handleUrlSubmit()}
                        disabled={isProcessing}
                        style={isProcessing ? disabledButtonStyle : buttonStyle}
                        aria-label="Analyze URL"
                      >
                        <LinkIcon />
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 2 && (
                <div style={{ padding: '8px 0' }}>
                  <div style={flexRowStyle}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      style={fullWidthButtonStyle}
                    >
                      <span style={{ marginRight: '8px' }}><FileIcon /></span>
                      Upload PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { setCurrentChat, deleteChat, loadChatsStart, loadChatsSuccess, loadChatsFailure } from '../features/chat/chatSlice';
import { Chat } from '../features/chat/chatSlice';
import { chatApi } from '../services/api';

// Simple search icon
const SearchIcon = () => <span>🔍</span>;

const HistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { chats, loading } = useSelector((state: RootState) => state.chat);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // 加载聊天历史
    const loadChats = async () => {
      dispatch(loadChatsStart());
      try {
        const response = await chatApi.getChats();
        dispatch(loadChatsSuccess(response.data));
      } catch (err) {
        dispatch(loadChatsFailure('Failed to load chat history'));
      }
    };
    
    loadChats();
  }, [dispatch, navigate, isAuthenticated]);
  
  const handleChatSelect = (chat: Chat) => {
    dispatch(setCurrentChat(chat));
    navigate('/chat');
  };
  
  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    
    try {
      await chatApi.deleteChat(chatId);
      dispatch(deleteChat(chatId));
      alert('Chat deleted');
    } catch (err) {
      alert('Failed to delete chat');
    }
  };
  
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some((msg) => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '768px',
    margin: '0 auto',
    padding: '32px 16px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
  };

  const searchContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '24px',
  };

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#718096',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    borderRadius: '4px',
    border: '1px solid #E2E8F0',
    fontSize: '16px',
  };

  const loadingTextStyle: React.CSSProperties = {
    fontSize: '16px',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 0',
  };

  const emptyStateTextStyle: React.CSSProperties = {
    fontSize: '18px',
    marginBottom: '16px',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#3182CE',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '4px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const deleteButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#E53E3E',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const chatListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const chatItemStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const chatItemHoverStyle: React.CSSProperties = {
    ...chatItemStyle,
    backgroundColor: '#F7FAFC',
  };

  const flexStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const chatInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  };

  const chatTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const chatMetaStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#718096',
  };

  const chatPreviewStyle: React.CSSProperties = {
    color: '#4A5568',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Chat History</h1>
      
      <div style={searchContainerStyle}>
        <div style={searchIconStyle}>
          <SearchIcon />
        </div>
        <input
          style={inputStyle}
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div style={loadingTextStyle}>Loading your chat history...</div>
      ) : filteredChats.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={emptyStateTextStyle}>
            {searchQuery ? 'No chats match your search' : 'No chat history found'}
          </p>
          <button
            style={buttonStyle}
            onClick={() => navigate('/chat')}
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <div style={chatListStyle}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              style={chatItemStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F7FAFC')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
              onClick={() => handleChatSelect(chat)}
            >
              <div style={flexStyle}>
                <div style={chatInfoStyle}>
                  <div style={chatTitleStyle}>{chat.title}</div>
                  <div style={chatMetaStyle}>
                    {chat.messages.length} messages • Last updated: {formatDate(chat.updatedAt)}
                  </div>
                  <div style={chatPreviewStyle}>
                    {chat.messages[chat.messages.length - 1]?.content.substring(0, 100)}
                    {chat.messages[chat.messages.length - 1]?.content.length > 100 ? '...' : ''}
                  </div>
                </div>
                <button
                  style={deleteButtonStyle}
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 
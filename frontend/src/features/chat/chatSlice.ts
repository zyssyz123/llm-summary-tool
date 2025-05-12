import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  currentChat: null,
  chats: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      if (state.currentChat) {
        state.currentChat.messages.push(action.payload);
      }
    },
    startNewChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
      state.chats.unshift(action.payload);
    },
    loadChatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadChatsSuccess: (state, action: PayloadAction<Chat[]>) => {
      state.loading = false;
      state.chats = action.payload;
    },
    loadChatsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateChatTitle: (state, action: PayloadAction<{ chatId: string; title: string }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        chat.title = action.payload.title;
      }
      if (state.currentChat && state.currentChat.id === action.payload.chatId) {
        state.currentChat.title = action.payload.title;
      }
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat.id !== action.payload);
      if (state.currentChat && state.currentChat.id === action.payload) {
        state.currentChat = null;
      }
    },
  },
});

export const {
  setCurrentChat,
  addMessage,
  startNewChat,
  loadChatsStart,
  loadChatsSuccess,
  loadChatsFailure,
  updateChatTitle,
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer; 
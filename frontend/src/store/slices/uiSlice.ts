import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  darkMode: boolean;
  selectedTopicId: string | null;
  selectedConsumerGroupId: string | null;
  alertMessage: {
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string | null;
  };
  refreshInterval: number; // in seconds
}

const initialState: UiState = {
  sidebarOpen: true,
  darkMode: false,
  selectedTopicId: null,
  selectedConsumerGroupId: null,
  alertMessage: {
    type: null,
    message: null,
  },
  refreshInterval: 60, // 1 minute default
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setSelectedTopicId: (state, action: PayloadAction<string | null>) => {
      state.selectedTopicId = action.payload;
    },
    setSelectedConsumerGroupId: (state, action: PayloadAction<string | null>) => {
      state.selectedConsumerGroupId = action.payload;
    },
    setAlertMessage: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning' | null;
        message: string | null;
      }>
    ) => {
      state.alertMessage = action.payload;
    },
    clearAlertMessage: (state) => {
      state.alertMessage = { type: null, message: null };
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  setSelectedTopicId,
  setSelectedConsumerGroupId,
  setAlertMessage,
  clearAlertMessage,
  setRefreshInterval,
} = uiSlice.actions;

export default uiSlice.reducer;
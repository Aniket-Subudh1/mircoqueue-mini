import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Topic, CreateTopicRequest } from '@/types/topic';
import * as topicsService from '@/services/topicsService';

interface TopicsState {
  topics: Topic[];
  currentTopic: Topic | null;
  loading: boolean;
  error: string | null;
  createTopicLoading: boolean;
  createTopicError: string | null;
}

const initialState: TopicsState = {
  topics: [],
  currentTopic: null,
  loading: false,
  error: null,
  createTopicLoading: false,
  createTopicError: null,
};

// Async thunks
export const fetchTopics = createAsyncThunk(
  'topics/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      return await topicsService.getTopics();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch topics');
    }
  }
);

export const fetchTopic = createAsyncThunk(
  'topics/fetchTopic',
  async (topicId: string, { rejectWithValue }) => {
    try {
      // Find in state first before fetching
      const topics = await topicsService.getTopics();
      const topic = topics.find(t => t.topicId === topicId);
      
      if (!topic) {
        throw new Error(`Topic with ID ${topicId} not found`);
      }
      
      return topic;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch topic');
    }
  }
);

export const createTopic = createAsyncThunk(
  'topics/createTopic',
  async (topicData: CreateTopicRequest, { rejectWithValue }) => {
    try {
      return await topicsService.createTopic(topicData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create topic');
    }
  }
);

export const deleteTopic = createAsyncThunk(
  'topics/deleteTopic',
  async (topicId: string, { rejectWithValue }) => {
    try {
      await topicsService.deleteTopic(topicId);
      return topicId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete topic');
    }
  }
);

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearTopicErrors: (state) => {
      state.error = null;
      state.createTopicError = null;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<Topic[]>) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single topic
      .addCase(fetchTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopic.fulfilled, (state, action: PayloadAction<Topic>) => {
        state.loading = false;
        state.currentTopic = action.payload;
      })
      .addCase(fetchTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create topic
      .addCase(createTopic.pending, (state) => {
        state.createTopicLoading = true;
        state.createTopicError = null;
      })
      .addCase(createTopic.fulfilled, (state, action: PayloadAction<Topic>) => {
        state.createTopicLoading = false;
        state.topics.push(action.payload);
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.createTopicLoading = false;
        state.createTopicError = action.payload as string;
      })
      
      // Delete topic
      .addCase(deleteTopic.fulfilled, (state, action: PayloadAction<string>) => {
        state.topics = state.topics.filter(topic => topic.topicId !== action.payload);
        if (state.currentTopic && state.currentTopic.topicId === action.payload) {
          state.currentTopic = null;
        }
      });
  },
});

export const { clearTopicErrors, clearCurrentTopic } = topicsSlice.actions;

export default topicsSlice.reducer;
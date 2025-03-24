import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConsumerGroup, CreateConsumerGroupRequest } from '@/types/consumer';
import * as consumerService from '@/services/consumerService';

interface ConsumersState {
  consumerGroups: ConsumerGroup[];
  currentConsumerGroup: ConsumerGroup | null;
  loading: boolean;
  error: string | null;
  createConsumerGroupLoading: boolean;
  createConsumerGroupError: string | null;
}

const initialState: ConsumersState = {
  consumerGroups: [],
  currentConsumerGroup: null,
  loading: false,
  error: null,
  createConsumerGroupLoading: false,
  createConsumerGroupError: null,
};

// Async thunks
export const fetchConsumerGroups = createAsyncThunk(
  'consumers/fetchConsumerGroups',
  async (topicId: string, { rejectWithValue }) => {
    try {
      return await consumerService.getConsumerGroups(topicId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch consumer groups');
    }
  }
);

export const createConsumerGroup = createAsyncThunk(
  'consumers/createConsumerGroup',
  async (groupData: CreateConsumerGroupRequest, { rejectWithValue }) => {
    try {
      return await consumerService.createConsumerGroup(groupData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create consumer group');
    }
  }
);

export const deleteConsumerGroup = createAsyncThunk(
  'consumers/deleteConsumerGroup',
  async (
    { groupId, topicId }: { groupId: string; topicId: string },
    { rejectWithValue }
  ) => {
    try {
      await consumerService.deleteConsumerGroup(groupId, topicId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete consumer group');
    }
  }
);

export const resetConsumerGroupOffset = createAsyncThunk(
  'consumers/resetConsumerGroupOffset',
  async (
    { groupId, topicId }: { groupId: string; topicId: string },
    { rejectWithValue }
  ) => {
    try {
      await consumerService.resetConsumerGroupOffset(groupId, topicId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset consumer group offset');
    }
  }
);

const consumersSlice = createSlice({
  name: 'consumers',
  initialState,
  reducers: {
    clearConsumerErrors: (state) => {
      state.error = null;
      state.createConsumerGroupError = null;
    },
    clearCurrentConsumerGroup: (state) => {
      state.currentConsumerGroup = null;
    },
    setCurrentConsumerGroup: (state, action: PayloadAction<ConsumerGroup>) => {
      state.currentConsumerGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch consumer groups
      .addCase(fetchConsumerGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsumerGroups.fulfilled, (state, action: PayloadAction<ConsumerGroup[]>) => {
        state.loading = false;
        state.consumerGroups = action.payload;
      })
      .addCase(fetchConsumerGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create consumer group
      .addCase(createConsumerGroup.pending, (state) => {
        state.createConsumerGroupLoading = true;
        state.createConsumerGroupError = null;
      })
      .addCase(createConsumerGroup.fulfilled, (state, action: PayloadAction<ConsumerGroup>) => {
        state.createConsumerGroupLoading = false;
        state.consumerGroups.push(action.payload);
      })
      .addCase(createConsumerGroup.rejected, (state, action) => {
        state.createConsumerGroupLoading = false;
        state.createConsumerGroupError = action.payload as string;
      })
      

      .addCase(deleteConsumerGroup.fulfilled, (state, action: PayloadAction<string>) => {
        state.consumerGroups = state.consumerGroups.filter(
          group => group.groupId !== action.payload
        );
        if (state.currentConsumerGroup && state.currentConsumerGroup.groupId === action.payload) {
          state.currentConsumerGroup = null;
        }
      })
      

      .addCase(resetConsumerGroupOffset.fulfilled, (state, action: PayloadAction<string>) => {
       
      });
  },
});

export const { 
  clearConsumerErrors, 
  clearCurrentConsumerGroup,
  setCurrentConsumerGroup
} = consumersSlice.actions;

export default consumersSlice.reducer;
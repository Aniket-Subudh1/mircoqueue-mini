// frontend/src/store/slices/metricsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SystemMetrics, TopicMetrics, DashboardMetrics } from '@/types/metrics';
import { metricsService } from '@/services/serviceFactory';

interface MetricsState {
  system: SystemMetrics | null;
  topicMetrics: TopicMetrics[];
  loading: boolean;
  error: string | null;
  // Historical metrics data for charts
  historicalData: {
    publishRates: { timestamp: number; value: number }[];
    consumeRates: { timestamp: number; value: number }[];
    messageCount: { timestamp: number; value: number }[];
    storageUsed: { timestamp: number; value: number }[];
  };
}

const initialState: MetricsState = {
  system: null,
  topicMetrics: [],
  loading: false,
  error: null,
  historicalData: {
    publishRates: [],
    consumeRates: [],
    messageCount: [],
    storageUsed: [],
  },
};

// Async thunks
export const fetchSystemMetrics = createAsyncThunk(
  'metrics/fetchSystemMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await metricsService.getDashboardMetrics();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system metrics');
    }
  }
);

export const fetchTopicMetrics = createAsyncThunk(
  'metrics/fetchTopicMetrics',
  async (topicId: string, { rejectWithValue }) => {
    try {
      return await metricsService.getTopicMetrics(topicId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch topic metrics');
    }
  }
);

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    clearMetricsErrors: (state) => {
      state.error = null;
    },
    // For saving historical data over time
    addHistoricalData: (state, action: PayloadAction<SystemMetrics>) => {
      const timestamp = Date.now();
      const metrics = action.payload;
      
      // Keep only the last 20 data points for each metric
      const MAX_HISTORY_LENGTH = 20;
      
      // Add new data point
      state.historicalData.publishRates.push({
        timestamp,
        value: metrics.averagePublishRate,
      });
      
      state.historicalData.consumeRates.push({
        timestamp,
        value: metrics.averageConsumeRate,
      });
      
      state.historicalData.messageCount.push({
        timestamp,
        value: metrics.totalMessages,
      });
      
      state.historicalData.storageUsed.push({
        timestamp,
        value: metrics.storageUsed,
      });
      
      // Trim arrays to maintain fixed length
      if (state.historicalData.publishRates.length > MAX_HISTORY_LENGTH) {
        state.historicalData.publishRates = state.historicalData.publishRates.slice(-MAX_HISTORY_LENGTH);
      }
      
      if (state.historicalData.consumeRates.length > MAX_HISTORY_LENGTH) {
        state.historicalData.consumeRates = state.historicalData.consumeRates.slice(-MAX_HISTORY_LENGTH);
      }
      
      if (state.historicalData.messageCount.length > MAX_HISTORY_LENGTH) {
        state.historicalData.messageCount = state.historicalData.messageCount.slice(-MAX_HISTORY_LENGTH);
      }
      
      if (state.historicalData.storageUsed.length > MAX_HISTORY_LENGTH) {
        state.historicalData.storageUsed = state.historicalData.storageUsed.slice(-MAX_HISTORY_LENGTH);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard metrics
      .addCase(fetchSystemMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemMetrics.fulfilled, (state, action: PayloadAction<DashboardMetrics>) => {
        state.loading = false;
        state.system = action.payload.system;
        state.topicMetrics = action.payload.topics;
        
        // Also add to historical data
        if (action.payload.system) {
          state.historicalData.publishRates.push({
            timestamp: Date.now(),
            value: action.payload.system.averagePublishRate,
          });
          
          state.historicalData.consumeRates.push({
            timestamp: Date.now(),
            value: action.payload.system.averageConsumeRate,
          });
          
          state.historicalData.messageCount.push({
            timestamp: Date.now(),
            value: action.payload.system.totalMessages,
          });
          
          state.historicalData.storageUsed.push({
            timestamp: Date.now(),
            value: action.payload.system.storageUsed,
          });
          
          // Keep only the last 20 data points
          const MAX_HISTORY_LENGTH = 20;
          Object.keys(state.historicalData).forEach(key => {
            const typedKey = key as keyof typeof state.historicalData;
            if (state.historicalData[typedKey].length > MAX_HISTORY_LENGTH) {
              state.historicalData[typedKey] = state.historicalData[typedKey].slice(-MAX_HISTORY_LENGTH);
            }
          });
        }
      })
      .addCase(fetchSystemMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single topic metrics
      .addCase(fetchTopicMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicMetrics.fulfilled, (state, action: PayloadAction<TopicMetrics>) => {
        state.loading = false;
        
        // Update or add the topic metrics
        const index = state.topicMetrics.findIndex(
          (tm) => tm.topicId === action.payload.topicId
        );
        
        if (index >= 0) {
          state.topicMetrics[index] = action.payload;
        } else {
          state.topicMetrics.push(action.payload);
        }
      })
      .addCase(fetchTopicMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMetricsErrors, addHistoricalData } = metricsSlice.actions;

export default metricsSlice.reducer;
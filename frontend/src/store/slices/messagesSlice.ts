// frontend/src/store/slices/messagesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  PublishMessageRequest, 
  PublishMessageResponse, 
  ConsumeMessagesRequest,
  ConsumeMessagesResponse,
  MessageWithPayload 
} from '@/types/message';
import { messagesService } from '@/services/serviceFactory';

interface MessagesState {
  messages: MessageWithPayload[];
  nextSequenceNumber: number;
  publishLoading: boolean;
  publishError: string | null;
  consumeLoading: boolean;
  consumeError: string | null;
}

const initialState: MessagesState = {
  messages: [],
  nextSequenceNumber: 0,
  publishLoading: false,
  publishError: null,
  consumeLoading: false,
  consumeError: null,
};

// Async thunks
export const publishMessage = createAsyncThunk(
  'messages/publishMessage',
  async (
    { topicId, message }: { topicId: string; message: PublishMessageRequest },
    { rejectWithValue }
  ) => {
    try {
      return await messagesService.publishMessage(topicId, message);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to publish message');
    }
  }
);

export const consumeMessages = createAsyncThunk(
  'messages/consumeMessages',
  async (
    { topicId, request }: { topicId: string; request: ConsumeMessagesRequest },
    { rejectWithValue }
  ) => {
    try {
      return await messagesService.consumeMessages(topicId, request);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to consume messages');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.nextSequenceNumber = 0;
    },
    clearMessageErrors: (state) => {
      state.publishError = null;
      state.consumeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Publish message
      .addCase(publishMessage.pending, (state) => {
        state.publishLoading = true;
        state.publishError = null;
      })
      .addCase(
        publishMessage.fulfilled,
        (state, action: PayloadAction<PublishMessageResponse>) => {
          state.publishLoading = false;
          // We could potentially add the published message to the state
          // but for now we'll just clear the error
        }
      )
      .addCase(publishMessage.rejected, (state, action) => {
        state.publishLoading = false;
        state.publishError = action.payload as string;
      })

      // Consume messages
      .addCase(consumeMessages.pending, (state) => {
        state.consumeLoading = true;
        state.consumeError = null;
      })
      .addCase(
        consumeMessages.fulfilled,
        (state, action: PayloadAction<ConsumeMessagesResponse>) => {
          state.consumeLoading = false;
          // Add new messages to the existing ones
          state.messages = [...state.messages, ...action.payload.messages];
          state.nextSequenceNumber = action.payload.nextSequenceNumber;
        }
      )
      .addCase(consumeMessages.rejected, (state, action) => {
        state.consumeLoading = false;
        state.consumeError = action.payload as string;
      });
  },
});

export const { clearMessages, clearMessageErrors } = messagesSlice.actions;

export default messagesSlice.reducer;
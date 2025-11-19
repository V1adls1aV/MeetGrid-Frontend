// Purpose: хранит загруженную тему и статус загрузки.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TopicState {
  topic: Record<string, unknown> | null;
  stats: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  topic: null,
  stats: null,
  loading: false,
  error: null,
};

const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    setTopic(state, action: PayloadAction<{ topic: Record<string, unknown>; stats: Record<string, unknown> }>) {
      state.topic = action.payload.topic;
      state.stats = action.payload.stats;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setTopic, setLoading, setError } = topicSlice.actions;
export default topicSlice.reducer;

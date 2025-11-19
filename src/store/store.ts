// Purpose: объединяет Redux-слайсы и экспортирует хранилище.
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import topicReducer from './topicSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    topic: topicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import authReducer from '../features/auth/authSlice';

// Additional slices (requests, writers, notifications...) are added
// in later phases as those features are built.
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
  },
});

export default store;

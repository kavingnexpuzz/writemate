import { createSlice } from '@reduxjs/toolkit';

const storedMode = typeof window !== 'undefined' ? window.localStorage.getItem('writemate_theme_mode') : null;

const initialState = {
  mode: storedMode === 'dark' ? 'dark' : 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('writemate_theme_mode', state.mode);
      }
    },
  },
});

export const { toggleThemeMode } = uiSlice.actions;
export default uiSlice.reducer;

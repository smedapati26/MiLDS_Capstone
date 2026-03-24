import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RecentSearch {
  text: string;
  addedAt: number;
}

export interface RecentSearchesState {
  items: RecentSearch[];
}

const MAX_RECENTS = 10;

const initialState: RecentSearchesState = {
  items: [],
};

const keyOf = (r: RecentSearch) => r.text.toLowerCase();

export const recentSearchesSlice = createSlice({
  name: 'recentSearches',
  initialState,
  reducers: {
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const incoming: RecentSearch = { text: action.payload, addedAt: Date.now() };
      const incomingKey = keyOf(incoming);

      state.items = [incoming, ...state.items.filter((x) => keyOf(x) !== incomingKey)].slice(0, MAX_RECENTS);
    },

    setRecentSearches: (state, action: PayloadAction<RecentSearch[]>) => {
      state.items = [...action.payload].sort((a, b) => b.addedAt - a.addedAt).slice(0, MAX_RECENTS);
    },

    removeRecentSearch: (state, action: PayloadAction<string>) => {
      const k = action.payload.toLowerCase();
      state.items = state.items.filter((x) => keyOf(x) !== k);
    },

    clearRecentSearches: (state) => {
      state.items = [];
    },
  },
});

export const { addRecentSearch, setRecentSearches, removeRecentSearch, clearRecentSearches } =
  recentSearchesSlice.actions;

export const recentSearchesReducer = recentSearchesSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const listSlice = createSlice({
  name: "list",
  initialState: {
    data: [],
  },
  reducers: {
    addList: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.data = action.payload;
      } else {
        state.data.push(action.payload);
      }
    },
    deleteList: (state, action) => {
      state.data = state.data.filter((board) => board.id !== action.payload);
    },
  },
});

export const { addList, deleteList } = listSlice.actions;
export default listSlice.reducer;

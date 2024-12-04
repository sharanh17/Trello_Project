import { createSlice } from "@reduxjs/toolkit";

const boardSlice = createSlice({
  name: "board",
  initialState: {
    data: [],
  },
  reducers: {
    addBoard: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.data = action.payload;
      } else {
        state.data.push(action.payload);
      }
    },
    deleteBoard: (state, action) => {
      state.data = state.data.filter((board) => board.id !== action.payload);
    },
  },
});

export const { addBoard, deleteBoard } = boardSlice.actions;
export default boardSlice.reducer;

// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import boardSlice from "../slices/boardSlice";
import listReducer from "../slices/boardDetailsSlice";

const store = configureStore({
  reducer: {
    board: boardSlice,
    list: listReducer,
  },
});

export default store;

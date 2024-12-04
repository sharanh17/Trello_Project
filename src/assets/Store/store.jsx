import { configureStore } from "@reduxjs/toolkit";
import boardSlice from "../Slices/boardSlice";
const store = configureStore({
  reducer: { board: boardSlice },
});

export default store;

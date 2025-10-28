import { configureStore } from "@reduxjs/toolkit";
import exampleReducer from "@/redux/slices/exampleslice";

export const store = configureStore({
  reducer: {
    example: exampleReducer, // you can add more slices later
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

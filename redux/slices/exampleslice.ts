import { createSlice } from "@reduxjs/toolkit";

const exampleslice = createSlice({
  name: "exampleslice",
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
  },
});

export const { increment } = exampleslice.actions;
export default exampleslice.reducer;

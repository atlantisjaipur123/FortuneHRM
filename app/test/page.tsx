"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { increment } from "@/redux/slices/exampleslice";

export default function TestPage() {
  const count = useSelector((state: RootState) => state.example.count);
  const dispatch = useDispatch();

  return (
    <div style={{ padding: 20 }}>
      <h1>Count: {count}</h1>
      <button onClick={() => dispatch(increment())}>Increase</button>
    </div>
  );
}

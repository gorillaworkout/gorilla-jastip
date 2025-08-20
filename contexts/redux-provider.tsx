"use client"

import type React from "react"
import { Provider } from "react-redux"

// Minimal dummy store to satisfy react-redux context
// This prevents errors from libraries that accidentally call react-redux hooks
const dummyStore = {
  getState: () => ({}),
  subscribe: () => () => {},
  dispatch: () => undefined,
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={dummyStore as any}>{children}</Provider>
}



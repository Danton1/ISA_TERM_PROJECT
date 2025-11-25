// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface ThemeContextProps {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  setTheme: () => { },
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>("system")

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

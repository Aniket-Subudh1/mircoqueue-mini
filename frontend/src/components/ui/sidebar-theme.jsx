"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "dark",
  setTheme: () => null,
})

export function SidebarThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "sidebar-theme",
  ...props
}) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useSidebarTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useSidebarTheme must be used within a SidebarThemeProvider")

  return context
}
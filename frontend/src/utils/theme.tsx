import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'gray' | 'dark'
const ThemeCtx = createContext<{ theme: Theme, setTheme: (t: Theme)=> void }>({ theme: 'light', setTheme: ()=>{} })

export function ThemeProvider({ children }:{ children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  return useContext(ThemeCtx)
}

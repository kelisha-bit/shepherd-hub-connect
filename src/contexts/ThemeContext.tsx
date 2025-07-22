import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  
  // Ensure theme is one of our allowed types
  const currentTheme = (theme as Theme) || defaultTheme;
  
  useEffect(() => {
    // Check if we're in dark mode
    const isDarkMode = 
      currentTheme === "dark" || 
      (currentTheme === "system" && 
       window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setIsDark(isDarkMode);
  }, [currentTheme]);

  const value = {
    theme: currentTheme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    isDark,
    isLight: !isDark,
    isSystem: currentTheme === "system",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  
  return context;
};
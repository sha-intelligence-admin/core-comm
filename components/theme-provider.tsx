"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { CustomThemeProviderProps } from "./types"

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

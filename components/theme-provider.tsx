"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"
import type { ThemeProviderProps } from "next-themes"

interface CustomThemeProviderProps extends Omit<ThemeProviderProps, "children"> {
  children: ReactNode
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

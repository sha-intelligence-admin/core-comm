import type { ReactNode } from "react"
import type { ThemeProviderProps } from "next-themes"

export interface CustomThemeProviderProps extends Omit<ThemeProviderProps, "children"> {
  children: ReactNode
}

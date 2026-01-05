import * as React from "react"

const MOBILE_BREAKPOINT = 1024

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses a media query listener to track window width changes.
 * 
 * @returns boolean indicating if the viewport width is less than the mobile breakpoint (1024px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

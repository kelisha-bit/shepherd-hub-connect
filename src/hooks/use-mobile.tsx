import * as React from "react"
import { useResponsive } from "@/contexts/ResponsiveContext"

// For backward compatibility, we'll keep the original MOBILE_BREAKPOINT constant
const MOBILE_BREAKPOINT = 768

/**
 * Legacy useIsMobile hook that now uses the ResponsiveContext
 * This ensures backward compatibility with existing components
 */
export function useIsMobile() {
  // Try to use the ResponsiveContext if available
  try {
    const { isMobile } = useResponsive()
    return isMobile
  } catch (error) {
    // Fallback to the original implementation if ResponsiveContext is not available
    // This ensures the hook works during the transition period
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
}

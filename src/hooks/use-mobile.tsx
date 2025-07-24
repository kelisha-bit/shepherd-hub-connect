import * as React from "react"
import { useResponsive } from "@/contexts/ResponsiveContext"

// For backward compatibility, we'll keep the original MOBILE_BREAKPOINT constant
const MOBILE_BREAKPOINT = 768

/**
 * Legacy useIsMobile hook that now uses the ResponsiveContext
 * This ensures backward compatibility with existing components
 */
export function useIsMobile() {
  // Always call useState and useEffect to maintain hook order
  const [fallbackIsMobile, setFallbackIsMobile] = React.useState<boolean | undefined>(undefined)
  const [useResponsiveContext, setUseResponsiveContext] = React.useState(true)
  
  // Always try to get the responsive context
  let contextIsMobile: boolean | null = null;
  try {
    const { isMobile } = useResponsive()
    contextIsMobile = isMobile
  } catch (error) {
    // If context is not available, we'll use fallback
    if (useResponsiveContext) {
      setUseResponsiveContext(false)
    }
  }

  // Always set up the fallback effect
  React.useEffect(() => {
    if (!useResponsiveContext) {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setFallbackIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      mql.addEventListener("change", onChange)
      setFallbackIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    }
  }, [useResponsiveContext])

  // Return the appropriate value
  if (useResponsiveContext && contextIsMobile !== null) {
    return contextIsMobile
  }
  
  return !!fallbackIsMobile
}

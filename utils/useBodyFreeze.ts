import { useEffect } from "react"

// Body freeze - used for modals and overlay menus
function useBodyFreeze(isMenuOpen: boolean) {
  useEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow

    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = originalStyle
    }

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isMenuOpen])
}

export default useBodyFreeze

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
// import { incidentStore } from "@/store/incidentStore"

export const useGlobalKeyboard = () => {
  const navigate = useNavigate()
  // const { selectedIncidentId } = useIncidentStore() // Example usage

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is active
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      // Ctrl + K: Command Palette (Placeholder for now)
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        console.log("Open Command Palette")
        // toggleCommandPalette()
      }

      // G + H: Go Home
      if (e.key === "g" && !e.ctrlKey && !e.metaKey) {
        // Simple sequence detection could be more robust
        // For now, let's just use single keys or simple combos
      }
      
      // Shift + / : Show Shortcuts?
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate])
}

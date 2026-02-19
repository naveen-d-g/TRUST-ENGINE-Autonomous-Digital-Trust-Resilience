import { useEffect } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { eventBus } from "../services/eventBus"

export const useRealtimeDashboard = () => {
  const applyRealtimeUpdate = useDashboardStore(s => s.applyRealtimeUpdate)

  useEffect(() => {
    const handleUpdate = (data: unknown) => {
      console.log("Dashboard Update:", data)
      // Apply partial updates without full refetch
      applyRealtimeUpdate(data as any)
    }

    eventBus.on("dashboard_update", handleUpdate)

    return () => {
      eventBus.off("dashboard_update", handleUpdate)
    }
  }, [applyRealtimeUpdate])
}

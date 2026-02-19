import { useEffect } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { socketService } from "../services/socket"
import { eventBus } from "../services/eventBus"
import { DashboardMetrics } from "../types/dashboard"

export const useRealtimeDashboard = () => {
  const setMetrics = useDashboardStore(s => s.setMetrics)

  useEffect(() => {
    // Ensure socket is connected
    socketService.connect()

    const handleUpdate = (data: unknown) => {
      console.log("Dashboard Update:", data)
      setMetrics(data as DashboardMetrics)
    }

    eventBus.on("dashboard_update", handleUpdate)

    return () => {
      eventBus.off("dashboard_update", handleUpdate)
    }
  }, [setMetrics])
}

import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useNotificationStore } from "@/store/notificationStore"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

const NotificationToast = () => {
  const { notifications, remove } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((note) => (
        <div
          key={note.id}
          className="bg-bgCard border border-gray-700 shadow-xl rounded-lg p-4 w-80 animate-in slide-in-from-right fade-in flex items-start gap-3"
        >
          {note.type === "success" && <CheckCircle className="text-neonGreen w-5 h-5" />}
          {note.type === "critical" && <XCircle className="text-neonRed w-5 h-5" />}
          {note.type === "warning" && <AlertCircle className="text-neonOrange w-5 h-5" />}
          {note.type === "info" && <Info className="text-neonBlue w-5 h-5" />}
          
          <div className="flex-1 text-sm text-gray-200">{note.message}</div>
          <button onClick={() => remove(note.id)} className="text-gray-500 hover:text-white">✕</button>
        </div>
      ))}
    </div>
  )
}

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bgPrimary text-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <NotificationToast />
    </div>
  )
}

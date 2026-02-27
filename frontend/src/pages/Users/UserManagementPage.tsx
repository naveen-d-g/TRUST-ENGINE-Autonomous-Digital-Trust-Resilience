import { useState, useEffect } from "react"
import { Users, Plus, Edit2, Trash2, Shield } from "lucide-react"
import { api } from "@/services/api"
import { Card } from "@/components/cards/Card"
import { Button } from "@/components/buttons/Button"
import { useNotificationStore } from "@/store/notificationStore"
import { useAuthStore } from "@/store/authStore"

interface User {
  user_id: string
  email: string
  role: string
  created_at: string
  last_login: string | null
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Form State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("analyst")

  const currentUser = useAuthStore((state) => state.user)
  const addNotification = useNotificationStore((state) => state.addNotification)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // Call the backend user list API
      const response = await api.get<User[]>("/api/v1/users/list")
      setUsers(response || [])
    } catch (err) {
      console.error("Failed to fetch users:", err)
      addNotification("Failed to load users", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user)
      setEmail(user.email)
      setPassword("") // Don't populate password on edit
      setRole(user.role)
    } else {
      setEditingUser(null)
      setEmail("")
      setPassword("")
      setRole("analyst")
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setEmail("")
    setPassword("")
    setRole("analyst")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update user
        const payload: any = { email, role }
        if (password) payload.password = password
        
        await api.put(`/api/v1/users/update/${editingUser.user_id}`, payload)
        addNotification("User updated successfully", "success")
      } else {
        // Create user
        const userId = `usr_${Math.random().toString(36).substr(2, 9)}`
        await api.post("/api/v1/users/create", {
          user_id: userId,
          email,
          password,
          role
        })
        addNotification("User created successfully", "success")
      }
      
      handleCloseModal()
      fetchUsers()
    } catch (err: any) {
      console.error("Save failed:", err)
      addNotification(err.response?.data?.message || "Failed to save user", "error")
    }
  }

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      addNotification("You cannot delete your own account", "error")
      return
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      await api.delete(`/api/v1/users/delete/${userId}`)
      addNotification("User deleted successfully", "success")
      fetchUsers()
    } catch (err: any) {
      addNotification(err.response?.data?.message || "Failed to delete user", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Users className="w-6 h-6 text-neonBlue" />
            User Management
          </h1>
          <p className="text-gray-400 mt-1">Manage RBAC roles and platform access</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* User Table Card */}
      <Card glow className="overflow-hidden p-0 border border-gray-800/60 bg-bgCard/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-gray-800/60 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="p-4 font-bold">Email / User ID</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Created</th>
                <th className="p-4 font-bold">Last Login</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.user_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white">{user.email}</span>
                        <span className="text-[10px] font-mono text-gray-500 mt-0.5">{user.user_id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-widest
                        ${user.role === 'admin' ? 'bg-neonPurple/10 text-neonPurple border-neonPurple/20' : 
                          user.role === 'analyst' ? 'bg-neonBlue/10 text-neonBlue border-neonBlue/20' : 
                          'bg-gray-800/50 text-gray-400 border-gray-700'}`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs tracking-wide text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs tracking-wide text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.user_id !== currentUser?.id && (
                          <button 
                            onClick={() => handleDelete(user.user_id)}
                            className="p-1.5 text-red-500/70 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <Card glow className="w-full max-w-md relative z-10 bg-[#0A0D14] p-6 animate-in slide-in-from-bottom-4 fade-in duration-200">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-bgSecondary border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neonBlue transition-colors"
                  placeholder="user@trustengine.ai"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Password {editingUser && <span className="text-gray-600">(Leave blank to keep current)</span>}
                </label>
                <input
                  type={editingUser ? "password" : "text"}
                  required={!editingUser}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-bgSecondary border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neonBlue transition-colors"
                  placeholder={editingUser ? "••••••••" : "Temporary password"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-bgSecondary border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neonBlue transition-colors appearance-none"
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="analyst">Analyst (SOC Access)</option>
                  <option value="viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-gray-800/60">
                <Button type="button" variant="secondary" onClick={handleCloseModal} className="w-full">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="w-full">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

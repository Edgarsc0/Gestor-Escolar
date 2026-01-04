import { Home, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/useAuth"

export function AdminHeader({ activeView, searchQuery, setSearchQuery }) {
    const { user } = useAuth()

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between p-10">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">
                    {activeView === "dashboard" && "Panel de Control"}
                    {activeView === "justifications" && "Bandeja de Solicitudes"}
                    {activeView === "schedules" && "Gestión de Horarios"}
                    {activeView === "groups" && "Gestión de Grupos"}
                    {activeView === "teachers" && "Gestión de Profesores"}
                    {activeView === "users" && "Directorio de Usuarios"}
                    {activeView === "relationships" && "Gestión de Tutores"}
                    {activeView === "upload" && "Carga Masiva CSV"}
                    {activeView === "subjects" && "Gestión de Materias"}
                    {activeView === "settings" && "Configuración"}
                </span>
            </div>

            <div className="flex items-center gap-4">

                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user?.full_name || "Administrador"}
                </span>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">

                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{user?.full_name?.substring(0, 2).toUpperCase() || "AD"}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
import { Home, Inbox, CalendarClock, Users, Upload, Layers, LogOut, GraduationCap, BookOpen, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/useAuth"

export function Sidebar({ activeView, setActiveView, pendingRequests }) {
    const { logout } = useAuth()

    return (
        <aside className="w-72 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl z-20">
            {/* Header / Logo */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">EduManager</h1>
                        <p className="text-xs text-slate-500 font-medium">Panel Administrativo</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-6 overflow-y-auto py-4 custom-scrollbar">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Principal</p>
                    <div className="space-y-1">
                        <NavItem
                            icon={<Home className="h-5 w-5" />}
                            label="Panel de Control"
                            isActive={activeView === "dashboard"}
                            onClick={() => setActiveView("dashboard")}
                        />
                        <NavItem
                            icon={<Inbox className="h-5 w-5" />}
                            label="Solicitudes"
                            isActive={activeView === "justifications"}
                            onClick={() => setActiveView("justifications")}
                            badge={pendingRequests}
                        />
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Gestión Académica</p>
                    <div className="space-y-1">
                        <NavItem
                            icon={<Layers className="h-5 w-5" />}
                            label="Grupos"
                            isActive={activeView === "groups"}
                            onClick={() => setActiveView("groups")}
                        />
                        <NavItem
                            icon={<BookOpen className="h-5 w-5" />}
                            label="Profesores"
                            isActive={activeView === "teachers"}
                            onClick={() => setActiveView("teachers")}
                        />
                        <NavItem
                            icon={<CalendarClock className="h-5 w-5" />}
                            label="Horarios"
                            isActive={activeView === "schedules"}
                            onClick={() => setActiveView("schedules")}
                        />
                        <NavItem
                            icon={<BookOpen className="h-5 w-5" />}
                            label="Materias"
                            isActive={activeView === "subjects"}
                            onClick={() => setActiveView("subjects")}
                        />
                        <NavItem
                            icon={<UserPlus className="h-5 w-5" />}
                            label="Tutores"
                            isActive={activeView === "relationships"}
                            onClick={() => setActiveView("relationships")}
                        />
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Administración</p>
                    <div className="space-y-1">
                        <NavItem
                            icon={<Users className="h-5 w-5" />}
                            label="Usuarios"
                            isActive={activeView === "users"}
                            onClick={() => setActiveView("users")}
                        />
                        <NavItem
                            icon={<Upload className="h-5 w-5" />}
                            label="Carga Masiva"
                            isActive={activeView === "upload"}
                            onClick={() => setActiveView("upload")}
                        />
                    </div>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-slate-800">
                        <span className="text-sm font-bold text-white">AD</span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Administrador</p>
                        <p className="text-xs text-slate-500 truncate">admin@escuela.edu</p>
                    </div>
                    <button onClick={logout} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

function NavItem({ icon, label, isActive, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
        >
            <span className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}>
                {icon}
            </span>
            <span className="font-medium text-sm">{label}</span>
            {badge > 0 && (
                <Badge className="ml-auto bg-red-500 hover:bg-red-600 text-white border-0 h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center">
                    {badge}
                </Badge>
            )}
        </button>
    )
}
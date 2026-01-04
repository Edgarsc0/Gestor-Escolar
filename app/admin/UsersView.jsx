import { useState, useEffect } from "react"
import ReactSelect from "react-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus, Pencil, Trash2, Loader2, AlertTriangle, Search, AlertCircle, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuccessModal } from "@/components/custom/SuccessDialog"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { UserProfileView } from "./UserProfileView"

export function UsersView({ searchQuery, onViewProfile }) {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [userFilter, setUserFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("active")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [userToDelete, setUserToDelete] = useState(null)
    const [dependencyData, setDependencyData] = useState(null)
    
    const [generatedPassword, setGeneratedPassword] = useState("")
    const [selectedRole, setSelectedRole] = useState("student")
    const [selectedStatus, setSelectedStatus] = useState("active")
    const [searchTerm, setSearchTerm] = useState("")
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                setUsers(await res.json())
            } else {
                setErrorDialog({ isOpen: true, title: "Error al cargar usuarios", description: "No se pudieron obtener los datos del servidor." })
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleNameChange = (e) => {
        const name = e.target.value
        if (!editingUser) {
            const parts = name.trim().split(/\s+/)
            if (parts.length >= 3) {
                const paternal = parts[parts.length - 2]
                const maternal = parts[parts.length - 1]
                if (paternal.length >= 4 && maternal.length >= 4) {
                    setGeneratedPassword(`${paternal.substring(0, 4)}${maternal.substring(0, 4)}`.toLowerCase())
                } else {
                    setGeneratedPassword(`${paternal}${maternal}`.toLowerCase())
                }
            } else {
                setGeneratedPassword("")
            }
        }
    }

    const handleSaveUser = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        
        const payload = {
            full_name: formData.get("full_name"),
            birth_date: formData.get("birth_date"),
            role: formData.get("role"),
            status: formData.get("status")
        }

        if (!editingUser) {
            payload.password = formData.get("password")
            payload.personal_email = formData.get("personal_email")
        }

        setIsSaving(true)
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
            const method = editingUser ? "PUT" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchUsers()
                setIsDialogOpen(false)
                setEditingUser(null)
                setGeneratedPassword("")
                setShowSuccessModal(true)
            } else {
                const data = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al guardar usuario", description: data.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error saving user:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        // Verificar dependencias antes de eliminar
        if (userToDelete.role === 'student') {
            const res = await fetch(`/api/user_relationships/student/${userToDelete.id}`)
            if (res.ok) {
                const rels = await res.json()
                if (rels.length > 0) {
                    setDependencyData({ type: 'student', items: rels, user: userToDelete })
                    setUserToDelete(null)
                    return
                }
            }
        } else if (userToDelete.role === 'tutor') {
            const res = await fetch(`/api/user_relationships/tutor/${userToDelete.id}`)
            if (res.ok) {
                const rels = await res.json()
                if (rels.length > 0) {
                    setDependencyData({ type: 'tutor', items: rels, user: userToDelete })
                    setUserToDelete(null)
                    return
                }
            }
        } else if (userToDelete.role === 'teacher') {
            const [groupsRes, schedulesRes] = await Promise.all([
                fetch(`/api/groups/teacher/${userToDelete.id}`),
                fetch(`/api/schedules/teacher/${userToDelete.id}`)
            ])
            const groups = groupsRes.ok ? await groupsRes.json() : []
            const schedules = schedulesRes.ok ? await schedulesRes.json() : []
            
            if (groups.length > 0 || schedules.length > 0) {
                setDependencyData({ type: 'teacher', items: { groups, schedules }, user: userToDelete })
                setUserToDelete(null)
                return
            }
        }

        await performDelete(userToDelete)
    }

    const performDelete = async (user) => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, status: 'inactive' } : u))
                setUserToDelete(null)
                setDependencyData(null)
            } else {
                const data = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al eliminar usuario", description: data.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error deleting user:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleConfirmDependencyAction = async () => {
        if (!dependencyData) return
        
        const { type, items, user } = dependencyData
        
        setIsSaving(true)
        if (type === 'student' || type === 'tutor') {
            // Eliminar relaciones
            await Promise.all(items.map(rel => fetch(`/api/user_relationships/${rel.id}`, { method: 'DELETE' })))
        } else if (type === 'teacher') {
            // Desvincular de grupos y horarios
            await Promise.all([
                fetch(`/api/groups/teacher/${user.id}`, { method: 'DELETE' }),
                fetch(`/api/schedules/teacher/${user.id}`, { method: 'DELETE' })
            ])
        }
        
        setIsSaving(false) 
        await performDelete(user)
    }

    const openNewDialog = () => {
        setEditingUser(null)
        setGeneratedPassword("")
        setSelectedRole("student")
        setSelectedStatus("active")
        setIsDialogOpen(true)
    }

    const openEditDialog = (user) => {
        setEditingUser(user)
        setGeneratedPassword("")
        setSelectedRole(user.role)
        setSelectedStatus(user.status)
        setIsDialogOpen(true)
    }

    const filteredUsers = users.filter(user => {
        const query = (searchTerm || searchQuery || "").toLowerCase()
        const matchesSearch = (user.full_name || "").toLowerCase().includes(query) ||
                            (user.email || "").toLowerCase().includes(query)
        const matchesRole = userFilter === "all" || user.role === userFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'student': return "bg-blue-100 text-blue-700 border-blue-200"
            case 'teacher': return "bg-purple-100 text-purple-700 border-purple-200"
            case 'tutor': return "bg-green-100 text-green-700 border-green-200"
            case 'admin': return "bg-slate-800 text-white border-slate-700"
            default: return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    const translateRole = (role) => {
        const map = { student: "Alumno", teacher: "Docente", tutor: "Tutor", admin: "Administrador" }
        return map[role] || role
    }

    const filterOptions = [
        { value: "all", label: "Todos" },
        { value: "student", label: "Alumnos" },
        { value: "teacher", label: "Docentes" },
        { value: "tutor", label: "Tutores" }
    ]

    const roleOptions = [
        { value: "student", label: "Alumno" },
        { value: "teacher", label: "Docente" },
        { value: "tutor", label: "Tutor" },
        { value: "admin", label: "Administrador" }
    ]

    const statusOptions = [
        { value: "all", label: "Todos los estados" },
        { value: "active", label: "Activos" },
        { value: "inactive", label: "Inactivos" }
    ]

    return (
        <div className="space-y-6 h-full flex flex-col">
            {(isLoading || isSaving) && <LoadingOverlay message={isSaving ? "Guardando cambios..." : "Cargando usuarios..."} />}
            
            <Card className="border-slate-200 flex flex-col overflow-hidden h-full">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Directorio de Usuarios</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="w-40">
                                <ReactSelect
                                    options={filterOptions}
                                    value={filterOptions.find(opt => opt.value === userFilter)}
                                    onChange={(option) => setUserFilter(option ? option.value : "all")}
                                    placeholder="Filtrar..."
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar usuario..."
                                    className="pl-8 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex flex-col h-full">
                        <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50">
                            <TabsList>
                                <TabsTrigger value="active">Activos</TabsTrigger>
                                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
                                <TabsTrigger value="all">Todos</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="pl-6">Nombre Completo</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Correo Electrónico</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right pr-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                                No se encontraron usuarios.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium pl-6">{user.full_name}</TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleBadgeColor(user.role)}>
                                                        {translateRole(user.role)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{user.email || "Sin asignar"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={user.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600"}>
                                                        {user.status === "active" ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Ver Perfil
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setUserToDelete(user)}>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del usuario. {!editingUser && "La contraseña se generará automáticamente."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveUser} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Nombre Completo</Label>
                            <Input 
                                id="full_name" 
                                name="full_name" 
                                defaultValue={editingUser?.full_name} 
                                onChange={handleNameChange}
                                placeholder="Ej. Juan Pérez Gómez"
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                <Input 
                                    id="birth_date" 
                                    name="birth_date" 
                                    type="date" 
                                    defaultValue={editingUser?.birth_date ? new Date(editingUser.birth_date).toISOString().split('T')[0] : ''} 
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Rol</Label>
                                <ReactSelect
                                    options={roleOptions}
                                    value={roleOptions.find(opt => opt.value === selectedRole)}
                                    onChange={(option) => setSelectedRole(option ? option.value : "student")}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    placeholder="Seleccionar rol..."
                                />
                                <input type="hidden" name="role" value={selectedRole} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <ReactSelect
                                    options={statusOptions.filter(o => o.value !== 'all')}
                                    value={statusOptions.find(opt => opt.value === selectedStatus)}
                                    onChange={(option) => setSelectedStatus(option ? option.value : "active")}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                />
                                <input type="hidden" name="status" value={selectedStatus} />
                            </div>
                        </div>
                        {!editingUser && (
                            <div className="grid gap-2">
                                <Label htmlFor="personal_email">Correo Personal (para envío de credenciales)</Label>
                                <Input 
                                    id="personal_email" 
                                    name="personal_email" 
                                    type="email" 
                                    placeholder="ejemplo@personal.com" 
                                    required 
                                />
                            </div>
                        )}
                        {!editingUser && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña Generada</Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    value={generatedPassword} 
                                    readOnly 
                                    className="bg-slate-100 text-slate-600 font-mono" 
                                />
                                <p className="text-xs text-slate-500">
                                    Formato: 4 letras apellido paterno + 4 letras apellido materno
                                </p>
                            </div>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.full_name}</strong>? 
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dependency Warning Dialog */}
            <Dialog open={!!dependencyData} onOpenChange={(open) => !open && setDependencyData(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            Usuario con vinculaciones
                        </DialogTitle>
                        <DialogDescription>
                            El usuario <strong>{dependencyData?.user?.full_name}</strong> tiene las siguientes asociaciones activas:
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 max-h-[60vh] overflow-y-auto text-sm text-slate-600 space-y-3">
                        {dependencyData?.type === 'tutor' && (
                            <div>
                                <p className="font-semibold mb-1">Tutor de los alumnos:</p>
                                <ul className="list-disc pl-5">
                                    {dependencyData.items.map(rel => (
                                        <li key={rel.id}>{rel.student_name} ({rel.relationship_type})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {dependencyData?.type === 'student' && (
                            <div>
                                <p className="font-semibold mb-1">Tiene asignados los tutores:</p>
                                <ul className="list-disc pl-5">
                                    {dependencyData.items.map(rel => (
                                        <li key={rel.id}>{rel.tutor_name} ({rel.relationship_type})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {dependencyData?.type === 'teacher' && (
                            <div>
                                <p className="mb-2">Tiene <strong>{dependencyData.items.groups.length}</strong> grupos asignados y <strong>{dependencyData.items.schedules.length}</strong> clases impartidas.</p>
                                <p className="italic text-xs">Se desvinculará de todas estas responsabilidades dejándolas como "Sin asignar".</p>
                            </div>
                        )}
                        <p className="mt-4 p-3 bg-amber-50 rounded border border-amber-100 text-amber-800">
                            ¿Deseas desvincular estas relaciones y proceder con la eliminación del usuario?
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDependencyData(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmDependencyAction} className="bg-red-600 hover:bg-red-700">Desvincular y Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            {errorDialog.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-700 pt-2">
                            {errorDialog.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SuccessModal 
                open={showSuccessModal} 
                onOpenChange={setShowSuccessModal} 
                description="El usuario ha sido guardado correctamente." 
            />
        </div>
    )
}
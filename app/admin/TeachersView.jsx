import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search, GraduationCap, AlertCircle, MoreVertical, Eye } from "lucide-react"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { SuccessModal } from "@/components/custom/SuccessDialog"

export function TeachersView({ onViewProfile }) {
    const [teachers, setTeachers] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [teacherToDelete, setTeacherToDelete] = useState(null)
    const [teacherWithAssignments, setTeacherWithAssignments] = useState(null)
    const [generatedPassword, setGeneratedPassword] = useState("")
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/users?role=teacher')
            if (res.ok) {
                const users = await res.json()
                setTeachers(users)
            } else {
                setErrorDialog({ isOpen: true, title: "Error al cargar docentes", description: "No se pudieron obtener los datos del servidor." })
            }
        } catch (error) {
            console.error("Error fetching teachers:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveTeacher = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        const payload = {
            full_name: `Prof. ${formData.get("full_name")}`,
            birth_date: formData.get("birth_date"),
            password: formData.get("password"),
            role: "teacher",
            status: "active"
        }

        setIsSaving(true)
        try {
            const url = editingTeacher ? `/api/users/${editingTeacher.id}` : "/api/users"
            const method = editingTeacher ? "PUT" : "POST"

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchTeachers()
                setIsDialogOpen(false)
                setEditingTeacher(null)
                setShowSuccessModal(true)
            } else {
                const data = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al guardar docente", description: data.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error saving teacher:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!teacherToDelete) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/users/${teacherToDelete.id}`, { method: "DELETE" })
            if (res.ok) {
                fetchTeachers()
                setTeacherToDelete(null)
            } else if (res.status === 409) {
                const data = await res.json()
                setTeacherWithAssignments({ teacher: teacherToDelete, ...data })
                setTeacherToDelete(null)
            } else {
                const data = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al eliminar docente", description: data.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error deleting teacher:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleForceDelete = async () => {
        if (!teacherWithAssignments) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/users/${teacherWithAssignments.teacher.id}?force=true`, { method: "DELETE" })
            if (res.ok) {
                fetchTeachers()
                setTeacherWithAssignments(null)
            } else {
                const data = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al eliminar docente", description: data.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error force deleting teacher:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const openNewDialog = () => {
        setEditingTeacher(null)
        setGeneratedPassword("")
        setIsDialogOpen(true)
    }

    const openEditDialog = (teacher) => {
        setEditingTeacher(teacher)
        setGeneratedPassword("")
        setIsDialogOpen(true)
    }

    const handleNameChange = (e) => {
        const name = e.target.value
        if (!editingTeacher) {
            const parts = name.trim().split(/\s+/)
            
            if (parts.length >= 3) {
                const paternal = parts[parts.length - 2]
                const maternal = parts[parts.length - 1]
                setGeneratedPassword(`${paternal.substring(0, 4)}${maternal.substring(0, 4)}`.toLowerCase())
            } else if (parts.length === 2) {
                const paternal = parts[1]
                const fragment = paternal.substring(0, 4).toLowerCase()
                setGeneratedPassword(`${fragment}${fragment}`)
            } else {
                setGeneratedPassword("")
            }
        }
    }

    const filteredTeachers = teachers.filter(t =>
        ((t.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.email || "").toLowerCase().includes(searchQuery.toLowerCase())) &&
        t.status === 'active'
    )

    return (
        <div className="space-y-6 h-full flex flex-col">
            {(isLoading || isSaving) && <LoadingOverlay message={isSaving ? "Guardando..." : "Cargando docentes..."} />}
            
            <Card className="border-slate-200 flex flex-col overflow-hidden h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-medium">Gestión de Docentes</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar docente..."
                                className="pl-8 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Docente
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Correo Electrónico</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell className="font-medium">{teacher.full_name}</TableCell>
                                    <TableCell className="text-slate-600">{teacher.email}</TableCell>
                                    <TableCell>
                                        <Badge className={teacher.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700"}>
                                            {teacher.status === "active" ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onViewProfile(teacher.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver Perfil
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setTeacherToDelete(teacher)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTeachers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        No se encontraron docentes registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTeacher ? "Editar Docente" : "Nuevo Docente"}</DialogTitle>
                        <DialogDescription>
                            Ingrese la información del profesor. {!editingTeacher && 'La contraseña por defecto es "temporal123".'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveTeacher} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Nombre Completo</Label>
                            <div className="flex gap-2">
                                <Input value="Prof." readOnly className="w-16 bg-slate-100 text-slate-600 text-center" tabIndex={-1} />
                                <Input 
                                    id="full_name" 
                                    name="full_name" 
                                    defaultValue={editingTeacher?.full_name?.replace(/^Prof\. /, '')} 
                                    onChange={handleNameChange} 
                                    required 
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                            <Input 
                                id="birth_date" 
                                name="birth_date" 
                                type="date" 
                                defaultValue={editingTeacher?.birth_date ? new Date(editingTeacher.birth_date).toISOString().split('T')[0] : ''} 
                                required 
                            />
                        </div>
                        {!editingTeacher && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña (Generada)</Label>
                                <Input id="password" name="password" type="text" value={generatedPassword} readOnly className="bg-slate-100 text-slate-600" />
                            </div>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!teacherToDelete} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar al docente {teacherToDelete?.full_name}? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeacherToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!teacherWithAssignments} onOpenChange={(open) => !open && setTeacherWithAssignments(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-amber-600">No se puede eliminar al docente</DialogTitle>
                        <DialogDescription>
                            El profesor <strong>{teacherWithAssignments?.teacher?.full_name}</strong> tiene asignaciones activas.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto">
                        {teacherWithAssignments?.assignments?.groups?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Es titular de los grupos:</h4>
                                <ul className="list-disc pl-5 text-sm text-slate-600">
                                    {teacherWithAssignments.assignments.groups.map((g, i) => (
                                        <li key={i}>{g.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {teacherWithAssignments?.assignments?.schedules?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Tiene clases asignadas:</h4>
                                <ul className="list-disc pl-5 text-sm text-slate-600">
                                    {teacherWithAssignments.assignments.schedules.map((s, i) => (
                                        <li key={i}>{s.subject_name} ({s.day_of_week} {s.start_time}-{s.end_time}) en {s.group_name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-sm mt-4 bg-amber-50 p-3 rounded border border-amber-100">
                            ¿Deseas desvincularlo de todos estos registros (dejando el campo profesor vacío) y proceder con la eliminación?
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeacherWithAssignments(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleForceDelete} className="bg-red-600 hover:bg-red-700">Desvincular y Eliminar</Button>
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
                description="El docente ha sido guardado correctamente." 
            />
        </div>
    )
}

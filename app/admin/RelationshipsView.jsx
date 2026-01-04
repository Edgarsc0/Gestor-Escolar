import { useState, useEffect } from "react"
import ReactSelect from "react-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserPlus, Trash2, Users, User, Download, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { SuccessModal } from "@/components/custom/SuccessDialog"

export function RelationshipsView() {
    const [students, setStudents] = useState([])
    const [tutors, setTutors] = useState([])
    const [studentsWithTutorIds, setStudentsWithTutorIds] = useState(new Set())
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [isRelationshipsLoading, setIsRelationshipsLoading] = useState(false)
    const [relationships, setRelationships] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedTutorOption, setSelectedTutorOption] = useState(null)
    const [relationshipType, setRelationshipType] = useState("")
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [confirmAction, setConfirmAction] = useState(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [studentsRes, tutorsRes, relsRes] = await Promise.all([
                    fetch('/api/users?role=student'),
                    fetch('/api/users?role=tutor'),
                    fetch('/api/user_relationships')
                ])

                if (studentsRes.ok) {
                    const data = await studentsRes.json()
                    setStudents(data.filter(s => s.status === 'active'))
                }
                if (tutorsRes.ok) {
                    const data = await tutorsRes.json()
                    setTutors(data.filter(t => t.status === 'active'))
                }
                if (relsRes.ok) {
                    const rels = await relsRes.json()
                    setStudentsWithTutorIds(new Set(Array.isArray(rels) ? rels.map(r => String(r.student_id)) : []))
                }
            } catch (error) {
                console.error("Error loading data:", error)
                setErrorDialog({ isOpen: true, title: "Error de carga", description: "No se pudieron cargar los datos iniciales." })
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedStudent) {
            fetchRelationships(selectedStudent.id)
        } else {
            setRelationships([])
        }
    }, [selectedStudent])

    const fetchRelationships = async (studentId) => {
        setIsRelationshipsLoading(true)
        try {
            const res = await fetch(`/api/user_relationships/student/${studentId}`)
            if (res.ok) {
                setRelationships(await res.json())
            } else {
                setErrorDialog({ isOpen: true, title: "Error al cargar relaciones", description: "No se pudieron obtener los tutores del alumno." })
            }
        } catch (error) {
            setRelationships([])
            console.error("Error fetching relationships:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsRelationshipsLoading(false)
        }
    }

    const handleAddRelationship = async (e) => {
        e.preventDefault()
        if (!selectedStudent || !selectedTutorOption || !relationshipType) return

        setIsSaving(true)
        try {
            const payload = {
                student_id: selectedStudent.id,
                tutor_id: selectedTutorOption.value,
                relationship_type: relationshipType
            }

            const res = await fetch('/api/user_relationships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchRelationships(selectedStudent.id)
                setIsDialogOpen(false)
                setSelectedTutorOption(null)
                setRelationshipType("")

                // Actualizar estado local de alumnos con tutor
                const newSet = new Set(studentsWithTutorIds)
                newSet.add(String(selectedStudent.id))
                setStudentsWithTutorIds(newSet)
                setShowSuccessModal(true)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al asignar tutor", description: errorData.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error adding relationship:", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRelationship = (id) => {
        setConfirmAction({ type: 'delete', id })
    }

    const executeConfirmAction = async () => {
        if (!confirmAction) return

        if (confirmAction.type === 'delete') {
            setIsSaving(true)
            try {
                const res = await fetch(`/api/user_relationships/${confirmAction.id}`, { method: 'DELETE' })
                if (res.ok) {
                    const updatedRelationships = relationships.filter(r => r.id !== confirmAction.id)
                    setRelationships(updatedRelationships)

                    // Si el alumno se queda sin tutores, actualizar el set
                    if (updatedRelationships.length === 0 && selectedStudent) {
                        const newSet = new Set(studentsWithTutorIds)
                        newSet.delete(String(selectedStudent.id))
                        setStudentsWithTutorIds(newSet)
                    }
                } else {
                    const data = await res.json()
                    setErrorDialog({ isOpen: true, title: "Error al eliminar relación", description: data.error || "Ocurrió un error inesperado." })
                }
            } catch (error) {
                console.error("Error deleting relationship:", error)
                setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
            } finally {
                setIsSaving(false)
            }
        }
        setConfirmAction(null)
    }

    const filteredStudents = students.filter(s =>
        (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const studentsWithoutTutor = filteredStudents.filter(s => !studentsWithTutorIds.has(String(s.id)))
    const studentsWithTutor = filteredStudents.filter(s => studentsWithTutorIds.has(String(s.id)))

    const relationshipOptions = [
        { value: 'Padre', label: 'Padre' },
        { value: 'Madre', label: 'Madre' },
        { value: 'Tío', label: 'Tío' },
        { value: 'Tutor Legal', label: 'Tutor Legal' }
    ];

    const handleExport = async () => {
        try {
            const res = await fetch('/api/user_relationships')
            if (!res.ok) return
            const allRels = await res.json()
            
            const headers = ["Nombre Alumno", "Email Alumno", "Nombre Tutor", "Email Tutor", "Parentesco"]
            const exportRows = []
            const tutorMap = new Map(tutors.map(t => [t.id, t]))

            students.forEach(student => {
                const studentRels = Array.isArray(allRels) ? allRels.filter(r => r.student_id === student.id) : []
                
                if (studentRels.length > 0) {
                    studentRels.forEach(rel => {
                        const tutor = tutorMap.get(rel.tutor_id)
                        exportRows.push([
                            student.full_name,
                            student.email,
                            tutor?.full_name || "Desconocido",
                            tutor?.email || "",
                            rel.relationship_type
                        ])
                    })
                } else {
                    exportRows.push([student.full_name, student.email, "Sin Asignar", "", ""])
                }
            })
            
            exportRows.sort((a, b) => a[0].localeCompare(b[0]))

            const csvContent = [
                headers.join(","),
                ...exportRows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
            ].join("\n")

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", "reporte_tutores.csv")
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Error exporting:", error)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {(isLoading || isRelationshipsLoading || isSaving) && <LoadingOverlay message={isSaving ? "Procesando..." : "Cargando relaciones..."} />}
            
            {/* Lista de Alumnos */}
            <Card className="lg:col-span-1 border-slate-200 flex flex-col overflow-hidden h-full">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Alumnos
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleExport} title="Exportar Excel">
                            <Download className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                    <div className="relative mt-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar alumno..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <Tabs defaultValue="without-tutor" className="flex flex-col h-full">
                        <div className="px-4 py-2 border-b border-slate-100">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="without-tutor">Sin Tutor ({studentsWithoutTutor.length})</TabsTrigger>
                                <TabsTrigger value="with-tutor">Con Tutor ({studentsWithTutor.length})</TabsTrigger>
                            </TabsList>
                        </div>

                        
                            <>
                                <TabsContent value="without-tutor" className="flex-1 overflow-auto m-0">
                                    <div className="divide-y divide-slate-100">
                                        {studentsWithoutTutor.length === 0 && (
                                            <div className="p-8 text-center text-slate-500">
                                                {searchQuery ? "No se encontraron alumnos." : "No hay alumnos sin tutor."}
                                            </div>
                                        )}
                                        {studentsWithoutTutor.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedStudent?.id === student.id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
                                            >
                                                <div>
                                                    <div className="font-medium text-slate-900">{student.full_name}</div>
                                                    <div className="text-sm text-slate-500">{student.email || "Sin email"}</div>
                                                </div>
                                                <Badge variant="outline" className="bg-white">
                                                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="with-tutor" className="flex-1 overflow-auto m-0">
                                    <div className="divide-y divide-slate-100">
                                        {studentsWithTutor.length === 0 && (
                                            <div className="p-8 text-center text-slate-500">
                                                {searchQuery ? "No se encontraron alumnos." : "No hay alumnos con tutor."}
                                            </div>
                                        )}
                                        {studentsWithTutor.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedStudent?.id === student.id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
                                            >
                                                <div>
                                                    <div className="font-medium text-slate-900">{student.full_name}</div>
                                                    <div className="text-sm text-slate-500">{student.email || "Sin email"}</div>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Con Tutor</Badge>
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>
                            </>
                        
                    </Tabs>
                </CardContent>
            </Card>

            {/* Detalles y Tutores */}
            <Card className="lg:col-span-2 border-slate-200 flex flex-col overflow-hidden h-full">
                {selectedStudent ? (
                    <>
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl">{selectedStudent.full_name}</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Gestión de Tutores y Padres de Familia</p>
                                </div>
                                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Asignar Tutor
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Tutores Asignados</h3>

                            {relationships.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Nombre del Tutor</TableHead>
                                                <TableHead>Relación</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {relationships.map(rel => (
                                                <TableRow key={rel.id}>
                                                    <TableCell className="font-medium">{rel.tutor_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{rel.relationship_type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{rel.tutor_email}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-red-600"
                                                            onClick={() => handleDeleteRelationship(rel.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                                    <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No hay tutores asignados a este alumno.</p>
                                    <p className="text-sm text-slate-400 mt-1">Haz clic en "Asignar Tutor" para agregar uno.</p>
                                </div>
                            )}
                        </CardContent>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/30">
                        <Users className="h-16 w-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium text-slate-500">Selecciona un alumno</p>
                        <p className="text-sm">Para ver y gestionar sus tutores asignados</p>
                    </div>
                )}
            </Card>

            {/* Modal de Asignación */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asignar Tutor</DialogTitle>
                        <DialogDescription>
                            Selecciona un tutor existente y define el tipo de relación con {selectedStudent?.full_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRelationship} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tutor</Label>
                            <ReactSelect
                                options={tutors.map(t => ({ value: t.id, label: t.full_name }))}
                                value={selectedTutorOption}
                                onChange={setSelectedTutorOption}
                                placeholder="Buscar tutor..."
                                isClearable
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Relación</Label>
                            <ReactSelect
                                options={relationshipOptions}
                                value={relationshipOptions.find(opt => opt.value === relationshipType)}
                                onChange={(option) => setRelationshipType(option ? option.value : "")}
                                placeholder="Selecciona el parentesco..."
                                isClearable
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Asignar</Button>
                        </DialogFooter>
                    </form>
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

            {/* Confirmation Dialog */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar acción</DialogTitle>
                        <DialogDescription>
                            {confirmAction?.type === 'delete' && "¿Estás seguro de eliminar esta asignación?"}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={executeConfirmAction} className="bg-red-600 hover:bg-red-700">Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SuccessModal 
                open={showSuccessModal} 
                onOpenChange={setShowSuccessModal} 
                description="El tutor ha sido asignado correctamente." 
            />
        </div>
    )
}
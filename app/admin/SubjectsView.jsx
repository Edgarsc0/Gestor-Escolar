
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, BookOpen, AlertCircle, Loader2 } from "lucide-react"
import ReactSelect from "react-select"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { SuccessModal } from "@/components/custom/SuccessDialog"

export function SubjectsView() {
    const [subjects, setSubjects] = useState([])
    const [academicLevels, setAcademicLevels] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState(null)
    const [subjectToDelete, setSubjectToDelete] = useState(null)
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })    
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [subjectsRes, levelsRes] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/AcademicLevels')
            ])
            if (subjectsRes.ok) setSubjects(await subjectsRes.json())
            if (levelsRes.ok) setAcademicLevels(await levelsRes.json())
        } catch (error) {
            console.error("Error fetching data:", error)
            setErrorDialog({ isOpen: true, title: "Error de Carga", description: "No se pudieron cargar los datos." })
        } finally {
            setIsLoading(false)
        }
    }

    const levelOptions = useMemo(() => academicLevels.map(l => ({ value: l.id, label: l.name })), [academicLevels])

    const handleSaveSubject = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const payload = {
            name: formData.get("name"),
            academic_level_id: formData.get("academic_level_id"),
            description: formData.get("description"),
        }

        setIsSaving(true)
        try {
            const url = editingSubject ? `/api/subjects/${editingSubject.id}` : "/api/subjects"
            const method = editingSubject ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchData()
                setIsDialogOpen(false)
                setEditingSubject(null)
                setShowSuccessModal(true)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al Guardar", description: errorData.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error saving subject:", error)
            setErrorDialog({ isOpen: true, title: "Error de Conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/subjects/${subjectToDelete.id}`, { method: 'DELETE' })
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== subjectToDelete.id))
                setSubjectToDelete(null)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al Eliminar", description: errorData.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error deleting subject:", error)
            setErrorDialog({ isOpen: true, title: "Error de Conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const openNewDialog = () => {
        setEditingSubject(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (subject) => {
        setEditingSubject(subject)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {(isLoading || isSaving) && <LoadingOverlay message={isSaving ? "Guardando..." : "Cargando materias..."} />}
            
            <Card className="border-slate-200 flex-col overflow-hidden h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-medium">Gestión de Materias</CardTitle>
                    </div>
                    <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Materia
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-6">
                    
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre de la Materia</TableHead>
                                    <TableHead>Nivel Académico</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell><Badge variant="outline">{subject.academic_level_name}</Badge></TableCell>
                                        <TableCell className="text-slate-600 truncate max-w-xs">{subject.description || "N/A"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(subject)}>
                                                    <Pencil className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setSubjectToDelete(subject)}>
                                                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSubject ? "Editar Materia" : "Nueva Materia"}</DialogTitle>
                        <DialogDescription>
                            Complete la información de la materia.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveSubject} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Materia</Label>
                            <Input id="name" name="name" defaultValue={editingSubject?.name} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="academic_level_id">Nivel Académico</Label>
                            <ReactSelect
                                name="academic_level_id"
                                options={levelOptions}
                                defaultValue={levelOptions.find(l => l.value === editingSubject?.academic_level_id)}
                                getOptionValue={(option) => option.value}
                                getOptionLabel={(option) => option.label}
                                placeholder="Seleccione un nivel..."
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea id="description" name="description" defaultValue={editingSubject?.description} />
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la materia <strong>{subjectToDelete?.name}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubjectToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteSubject} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
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
                description="La materia ha sido guardada correctamente." 
            />
        </div>
    )
}
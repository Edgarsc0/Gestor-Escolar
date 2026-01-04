import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Users, Search, Layers, UserPlus, UserMinus, AlertTriangle, AlertCircle } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { GroupFormDialog } from "./GroupFormDialog"
import { EnrollmentDialog } from "./EnrollmentDialog"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { SuccessModal } from "@/components/custom/SuccessDialog"

export function GroupsView({ onViewProfile }) {
    const { 
        groups, teachers, academicLevels, students, 
        isLoading, isStudentsLoading, 
        fetchStudents, createGroup, updateGroup, deleteGroup, 
        removeStudent, emptyGroup, enrollStudents 
    } = useGroups()

    const [selectedLevel, setSelectedLevel] = useState("all")
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState(null)
    const [searchStudent, setSearchStudent] = useState("")
    const [actionToConfirm, setActionToConfirm] = useState(null)
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [teacherUpdateData, setTeacherUpdateData] = useState(null)
    const [selectedScheduleIds, setSelectedScheduleIds] = useState(new Set())
    const [conflictReport, setConflictReport] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

    useEffect(() => {
        if (selectedGroup) {
            fetchStudents(selectedGroup.id)
        }
    }, [selectedGroup, fetchStudents])

    const filteredGroups = selectedLevel === "all"
        ? groups
        : groups.filter(g => g.level_slug === selectedLevel)

    const isOverlap = (start1, end1, start2, end2) => {
        const toMin = (t) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
        }
        const s1 = toMin(start1), e1 = toMin(end1)
        const s2 = toMin(start2), e2 = toMin(end2)
        return Math.max(s1, s2) < Math.min(e1, e2)
    }

    const handleSaveGroup = async (formData) => {
        const newTeacherId = formData.get("teacher")
        const payload = {
            name: formData.get("name"),
            academic_level_id: academicLevels.find(l => l.slug === formData.get("level"))?.id,
            main_teacher_id: newTeacherId,
            capacity: parseInt(formData.get("capacity"))
        }
        try {
            if (editingGroup) {
                // Detectar cambio de profesor
                if (editingGroup.main_teacher_id != newTeacherId && newTeacherId) {
                    const scheduleRes = await fetch(`/api/schedules/group/${editingGroup.id}`)
                    const groupSchedule = scheduleRes.ok ? await scheduleRes.json() : []

                    if (groupSchedule.length > 0) {
                        const teacherRes = await fetch(`/api/schedules/teacher/${newTeacherId}`)
                        const teacherSchedule = teacherRes.ok ? await teacherRes.json() : []

                        setTeacherUpdateData({
                            group: editingGroup,
                            payload,
                            newTeacherId,
                            groupSchedule,
                            teacherSchedule
                        })
                        setSelectedScheduleIds(new Set(groupSchedule.map(s => s.id)))
                        return
                    }
                }
                setActionToConfirm({ type: 'update', group: editingGroup, payload })
            } else {
                setIsSaving(true)
                const success = await createGroup(payload)
                if (success) {
                    setIsDialogOpen(false)
                    setSuccessMessage("El grupo ha sido creado correctamente.")
                    setShowSuccessModal(true)
                }
            }
        } catch (error) {
            setErrorDialog({ isOpen: true, title: "Error inesperado", description: "Ocurrió un error al procesar la solicitud." })
        } finally {
            setIsSaving(false)
        }
    }

    const executeTeacherUpdate = async () => {
        if (!teacherUpdateData) return

        const { groupSchedule, teacherSchedule, newTeacherId, payload, group } = teacherUpdateData
        const successes = []
        const failures = []

        const itemsToUpdate = groupSchedule.filter(s => selectedScheduleIds.has(s.id))

        setTeacherUpdateData(null)
        setIsDialogOpen(false)

        setIsSaving(true)
        for (const item of itemsToUpdate) {
            const hasConflict = teacherSchedule.some(t => 
                t.day_of_week === item.day_of_week &&
                isOverlap(item.start_time, item.end_time, t.start_time, t.end_time)
            )

            if (hasConflict) {
                failures.push(item)
            } else {
                try {
                    const res = await fetch(`/api/schedules/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            group_id: item.group_id,
                            day_of_week: item.day_of_week,
                            start_time: item.start_time,
                            end_time: item.end_time,
                            subject_id: item.subject_id,
                            teacher_id: newTeacherId
                        })
                    })
                    if (res.ok) {
                        successes.push(item)
                        teacherSchedule.push({
                            day_of_week: item.day_of_week,
                            start_time: item.start_time,
                            end_time: item.end_time
                        })
                    } else {
                        failures.push({ ...item, reason: "Error al guardar" })
                    }
                } catch (e) {
                    failures.push({ ...item, reason: "Error de conexión" })
                }
            }
        }
        setIsSaving(false)

        if (failures.length > 0) {
            setConflictReport({ successes, failures, pendingGroupUpdate: { group, payload } })
        } else {
            setActionToConfirm({ type: 'update', group, payload })
        }
    }

    const handleSkipTeacherUpdate = () => {
        if (!teacherUpdateData) return
        const { group, payload } = teacherUpdateData
        setTeacherUpdateData(null)
        setActionToConfirm({ type: 'update', group, payload })
    }

    const handleConfirmAction = async () => {
        if (!actionToConfirm) return

        setIsSaving(true)
        if (actionToConfirm.type === 'delete') {
            try {
                const res = await fetch(`/api/groups/${actionToConfirm.group.id}`, { method: 'DELETE' })
                if (res.ok) {
                    if (selectedGroup?.id === actionToConfirm.group.id) setSelectedGroup(null)
                    window.location.reload()
                } else {
                    const data = await res.json()
                    setErrorDialog({ isOpen: true, title: "Error al eliminar grupo", description: data.error || "Ocurrió un error inesperado." })
                }
            } catch (error) {
                setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
            }
        } else if (actionToConfirm.type === 'delete_student') {
            await removeStudent(selectedGroup.id, actionToConfirm.student.id)
        } else if (actionToConfirm.type === 'empty_group') {
            await emptyGroup(selectedGroup.id)
        } else if (actionToConfirm.type === 'update') {
            const success = await updateGroup(actionToConfirm.group.id, actionToConfirm.payload)
            if (success) {
                setIsDialogOpen(false)
                setEditingGroup(null)
                setSuccessMessage("El grupo ha sido actualizado correctamente.")
                setShowSuccessModal(true)
            }
        }
        setIsSaving(false)
        setActionToConfirm(null)
    }

    const handleCloseConflictReport = async () => {
        if (conflictReport?.pendingGroupUpdate) {
            setIsSaving(true)
            const { group, payload } = conflictReport.pendingGroupUpdate
            const success = await updateGroup(group.id, payload)
            if (success) {
                setEditingGroup(null)
                setSuccessMessage("Grupo actualizado (con reportes de horario).")
                setShowSuccessModal(true)
            }
            setIsSaving(false)
        }
        setConflictReport(null)
    }

    const openEditDialog = (group) => {
        setEditingGroup(group)
        setIsDialogOpen(true)
    }

    const openNewDialog = () => {
        setEditingGroup(null)
        setIsDialogOpen(true)
    }

    const getLevelBadgeColor = (slug) => {
        const colors = {
            kinder: "bg-pink-500 border-pink-600",
            primaria: "bg-blue-500 border-blue-600",
            secundaria: "bg-purple-500 border-purple-600",
            preparatoria: "bg-orange-500 border-orange-600",
            bachillerato: "bg-orange-500 border-orange-600"
        }
        return colors[slug] || "bg-slate-500 border-slate-600"
    }

    const handleEnroll = async (selectedIds, leavingCounts) => {
        setIsSaving(true)
        const success = await enrollStudents(selectedGroup.id, selectedIds, leavingCounts)
        if (success) {
            setIsEnrollDialogOpen(false)
            setSuccessMessage("Alumnos inscritos correctamente.")
            setShowSuccessModal(true)
        }
        setIsSaving(false)
    }

    const filteredStudents = students.filter(student =>
        (student.full_name || "").toLowerCase().includes(searchStudent.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchStudent.toLowerCase())
    )

    return (
        <>
            <div className="space-y-6 h-full flex flex-col">
                {(isLoading || isStudentsLoading || isSaving) && <LoadingOverlay message={isSaving ? "Guardando cambios..." : "Cargando grupos..."} />}


                {/* Selector de Nivel */}
                <div className="flex gap-2">
                    
                        <>
                            <Button
                                variant={selectedLevel === "all" ? "default" : "outline"}
                                onClick={() => {
                                    setSelectedLevel("all")
                                    setSelectedGroup(null)
                                }}
                                className={selectedLevel === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                Todos
                            </Button>
                            {academicLevels.map((level) => (
                                <Button
                                    key={level.id}
                                    variant={selectedLevel === level.slug ? "default" : "outline"}
                                    onClick={() => {
                                        setSelectedLevel(level.slug)
                                        setSelectedGroup(null)
                                    }}
                                    className={`capitalize ${selectedLevel === level.slug ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                                >
                                    {level.name}
                                </Button>
                            ))}
                        </>
                    
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Lista de Grupos */}
                    <Card className="lg:col-span-1 border-slate-200 flex flex-col overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100">
                            <CardTitle className="text-lg font-medium">Grupos</CardTitle>
                            <Button size="sm" onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-4">
                            <div className="space-y-3">
                                {(filteredGroups.map(group => (
                                    <div
                                        key={group.id}
                                        onClick={() => setSelectedGroup(group)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedGroup?.id === group.id
                                            ? "bg-blue-50 border-blue-300 shadow-sm"
                                            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-200"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-900">{group.name}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{group.teacher_name || "Sin asignar"}</p>
                                            </div>
                                            <div>
                                                <Badge variant="primary" className={`${getLevelBadgeColor(group.level_slug)} text-white font-bold mb-2`}>
                                                    {group.level_name}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                    {group.student_count}/{group.capacity}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-100/50">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditDialog(group)
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-400 hover:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setActionToConfirm({ type: 'delete', group })
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )))}
                                {filteredGroups.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        <Layers className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>No hay grupos registrados en este nivel.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detalles del Grupo y Alumnos */}
                    <Card className="lg:col-span-2 border-slate-200 flex flex-col overflow-hidden">
                        {selectedGroup ? (
                            <>
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-xl">{selectedGroup.name}</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {selectedGroup.teacher_name} • Capacidad: {selectedGroup.capacity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => setActionToConfirm({ type: 'empty_group', group: selectedGroup })}
                                            >
                                                <UserMinus className="h-4 w-4 mr-2" />
                                                Vaciar
                                            </Button>
                                            <Button size="sm" onClick={() => setIsEnrollDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Inscribir Alumnos
                                            </Button>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Buscar alumno..."
                                                    className="pl-8 bg-white"
                                                    value={searchStudent}
                                                    onChange={(e) => setSearchStudent(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-auto p-5">
                                    
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStudents.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                                        <TableCell className="text-slate-600">{student.email}</TableCell>
                                                        <TableCell>
                                                            <Badge className={student.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700"}>
                                                                {student.status === "active" ? "Activo" : "Inactivo"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="sm" onClick={() => onViewProfile(student.id)}>
                                                                    Ver Perfil
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                                    onClick={() => setActionToConfirm({ type: 'delete_student', student })}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/30">
                                <Users className="h-16 w-16 mb-4 opacity-10" />
                                <p className="text-lg font-medium text-slate-500">Selecciona un grupo</p>
                                <p className="text-sm">Verás los detalles y la lista de alumnos inscritos</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Diálogo Crear/Editar */}
                <GroupFormDialog 
                    isOpen={isDialogOpen} 
                    onClose={setIsDialogOpen} 
                    onSave={handleSaveGroup} 
                    group={editingGroup} 
                    teachers={teachers.filter(t => t.status === 'active')} 
                    academicLevels={academicLevels} 
                />

                {/* Diálogo de Actualización de Profesor en Horario */}
                <Dialog open={!!teacherUpdateData} onOpenChange={(open) => !open && setTeacherUpdateData(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Actualizar Profesor en Horario</DialogTitle>
                            <DialogDescription>
                                Has cambiado el profesor titular. ¿Deseas asignar al nuevo profesor a las clases existentes de este grupo?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input 
                                                type="checkbox" 
                                                checked={teacherUpdateData?.groupSchedule.length > 0 && selectedScheduleIds.size === teacherUpdateData.groupSchedule.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedScheduleIds(new Set(teacherUpdateData.groupSchedule.map(s => s.id)))
                                                    } else {
                                                        setSelectedScheduleIds(new Set())
                                                    }
                                                }}
                                                className="rounded border-slate-300"
                                            />
                                        </TableHead>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Día</TableHead>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Profesor Actual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teacherUpdateData?.groupSchedule.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedScheduleIds.has(item.id)}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedScheduleIds)
                                                        if (e.target.checked) newSet.add(item.id)
                                                        else newSet.delete(item.id)
                                                        setSelectedScheduleIds(newSet)
                                                    }}
                                                    className="rounded border-slate-300"
                                                />
                                            </TableCell>
                                            <TableCell>{item.subject_name}</TableCell>
                                            <TableCell>{item.day_of_week}</TableCell>
                                            <TableCell>{item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</TableCell>
                                            <TableCell>{item.teacher_name || "Sin asignar"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleSkipTeacherUpdate}>No actualizar horario</Button>
                            <Button onClick={executeTeacherUpdate} className="bg-blue-600 hover:bg-blue-700">Actualizar Seleccionados</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Diálogo de Reporte de Conflictos */}
                <Dialog open={!!conflictReport} onOpenChange={() => handleCloseConflictReport()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                                Reporte de Actualización
                            </DialogTitle>
                            <DialogDescription>
                                Se han procesado las actualizaciones del horario.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="text-sm">
                                <p className="text-green-600 font-medium mb-1">Actualizaciones exitosas: {conflictReport?.successes.length}</p>
                                {conflictReport?.failures.length > 0 && (
                                    <>
                                        <p className="text-red-600 font-medium mt-3 mb-1">No se pudieron actualizar ({conflictReport.failures.length}):</p>
                                        <ul className="list-disc pl-5 text-slate-600 max-h-40 overflow-y-auto">
                                            {conflictReport.failures.map((fail, idx) => (
                                                <li key={idx}>
                                                    {fail.subject_name} ({fail.day_of_week} {fail.start_time.substring(0,5)}): {fail.reason || "Conflicto de horario"}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-slate-500 mt-2">
                                            El nuevo profesor ya tiene clases asignadas en estos horarios o ocurrió un error.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCloseConflictReport}>Continuar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Diálogo de Confirmación */}
                <Dialog open={!!actionToConfirm} onOpenChange={(open) => !open && setActionToConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar acción</DialogTitle>
                            <DialogDescription>
                                {actionToConfirm?.type === 'delete'
                                    ? `¿Estás seguro de que deseas eliminar el grupo "${actionToConfirm?.group?.name}"? Esta acción no se puede deshacer.`
                                    : actionToConfirm?.type === 'delete_student'
                                        ? `¿Estás seguro de que deseas dar de baja al alumno "${actionToConfirm?.student?.full_name}" de este grupo?`
                                        : actionToConfirm?.type === 'empty_group'
                                        ? `¿Estás seguro de que deseas eliminar a TODOS los alumnos del grupo "${actionToConfirm?.group?.name}"? Esta acción no se puede deshacer.`
                                        : `¿Estás seguro de que deseas guardar los cambios para el grupo "${actionToConfirm?.group?.name}"?`
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setActionToConfirm(null)}>Cancelar</Button>
                            <Button
                                className={(actionToConfirm?.type === 'delete' || actionToConfirm?.type === 'empty_group') ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                                onClick={handleConfirmAction}
                            >
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Diálogo de Inscripción de Alumnos */}
                <EnrollmentDialog 
                    isOpen={isEnrollDialogOpen} 
                    onClose={setIsEnrollDialogOpen} 
                    group={selectedGroup} 
                    onEnroll={handleEnroll} 
                    currentStudentIds={students.map(s => s.id)} 
                />

                <SuccessModal 
                    open={showSuccessModal} 
                    onOpenChange={setShowSuccessModal} 
                    description={successMessage} 
                />

                <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                {errorDialog.title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-700 pt-2">{errorDialog.description}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter><Button onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>Entendido</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

import { useState, useEffect, useMemo } from "react"
import ReactSelect from "react-select"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CalendarClock, Plus, Edit, Trash2, CheckCircle2, Users, Loader2, Printer, AlertCircle } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { SuccessModal } from "@/components/custom/SuccessDialog"

export function SchedulesView() {
    const { groups, academicLevels, teachers, isLoading } = useGroups()

    const [selectedLevel, setSelectedLevel] = useState("")
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState(null)
    const [groupSchedule, setGroupSchedule] = useState([])
    const [isScheduleLoading, setIsScheduleLoading] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [confirmAction, setConfirmAction] = useState(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    useEffect(() => {
        if (!isLoading && academicLevels.length > 0 && !selectedLevel) {
            setSelectedLevel(academicLevels[0].slug)
        }
    }, [isLoading, academicLevels, selectedLevel])

    useEffect(() => {
        if (selectedGroup) {
            const fetchSchedule = async () => {
                setIsScheduleLoading(true)
                try {
                    const res = await fetch(`/api/schedules/group/${selectedGroup.id}`)
                    if (res.ok) {
                        const data = await res.json()
                        // Mapeamos los datos del backend al formato que usa la vista
                        const formatted = data.map(s => ({
                            id: s.id,
                            day: s.day_of_week,
                            time: `${s.start_time}-${s.end_time}`,
                            subject_name: s.subject_name,
                            subject_id: s.subject_id,
                            teacher: s.teacher_name, // Nombre para mostrar
                            teacher_id: s.teacher_id // ID para editar
                        }))
                        setGroupSchedule(formatted)
                    } else {
                        setGroupSchedule([])
                        setErrorDialog({ isOpen: true, title: "Error al cargar horario", description: "No se pudo obtener el horario del grupo." })
                    }
                } catch (error) {
                    console.error("Error fetching schedule:", error)
                    setGroupSchedule([])
                    setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
                } finally {
                    setIsScheduleLoading(false)
                }
            }
            fetchSchedule()
        } else {
            setGroupSchedule([])
        }

        if (selectedGroup?.academic_level_id) {
            const fetchSubjects = async () => {
                try {
                    const res = await fetch(`/api/subjects?academic_level_id=${selectedGroup.academic_level_id}`);
                    if (res.ok) {
                        setSubjects(await res.json());
                    }
                } catch (error) {
                    console.error("Error fetching subjects:", error);
                }
            };
            fetchSubjects();
        } else {
            setSubjects([]);
        }
    }, [selectedGroup])

    const timeSlots = [
        "7:00-8:00",
        "8:00-9:00",
        "9:00-10:00",
        "10:00-11:00",
        "11:00-12:00",
        "12:00-13:00",
        "13:00-14:00",
        "14:00-15:00",
    ]

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

    const filteredGroups = useMemo(() => {
        if (!selectedLevel) return []
        return groups.filter(g => g.level_slug === selectedLevel)
    }, [groups, selectedLevel])

    const selectedLevelName = useMemo(() => {
        return academicLevels.find(l => l.slug === selectedLevel)?.name || ""
    }, [academicLevels, selectedLevel])

    const dayOptions = useMemo(() => days.map(day => ({ value: day, label: day })), [days]);
    const timeSlotOptions = useMemo(() => timeSlots.map(slot => ({ value: slot, label: slot })), [timeSlots]);
    const subjectOptions = useMemo(() => subjects.map(subject => ({ value: subject.id.toString(), label: subject.name })), [subjects]);
    const teacherOptions = useMemo(() => teachers.filter(t => t.status === 'active').map(teacher => ({ value: teacher.id.toString(), label: teacher.full_name })), [teachers]);

    const handleEditSchedule = (scheduleItem) => {
        setEditingSchedule(scheduleItem)
        setScheduleDialogOpen(true)
    }

    const handleAddSchedule = () => {
        setEditingSchedule({
            day: "Lunes",
            time: "8:00-9:00",
            subject_id: "",
            teacher_id: selectedGroup?.main_teacher_id ? selectedGroup.main_teacher_id.toString() : ""
        })
        setScheduleDialogOpen(true)
    }

    const handleSaveSchedule = async () => {
        if (!editingSchedule.time || !editingSchedule.subject_id || !editingSchedule.teacher_id) return

        // Validar traslape de horario
        const hasOverlap = groupSchedule.some(s =>
            s.day === editingSchedule.day &&
            s.time === editingSchedule.time &&
            s.id !== editingSchedule.id
        )

        if (hasOverlap) {
            setErrorDialog({ isOpen: true, title: "Conflicto de horario", description: "Ya existe una clase programada para este día y horario." })
            return
        }

        setIsScheduleLoading(true)
        try {
            const [start_time, end_time] = editingSchedule.time.split('-')

            const payload = {
                group_id: selectedGroup.id,
                day_of_week: editingSchedule.day,
                start_time,
                end_time,
                subject_id: editingSchedule.subject_id,
                teacher_id: editingSchedule.teacher_id
            }

            let res;
            if (editingSchedule.id) {
                res = await fetch(`/api/schedules/${editingSchedule.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                res = await fetch('/api/schedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            if (res.ok) {
                // Recargar horarios
                const refreshRes = await fetch(`/api/schedules/group/${selectedGroup.id}`)
                if (refreshRes.ok) {
                    const data = await refreshRes.json()
                    const formatted = data.map(s => ({
                        id: s.id,
                        day: s.day_of_week,
                        time: `${s.start_time}-${s.end_time}`,
                        subject_name: s.subject_name,
                        subject_id: s.subject_id,
                        teacher: s.teacher_name,
                        teacher_id: s.teacher_id
                    }))
                    setGroupSchedule(formatted)
                }
                setScheduleDialogOpen(false)
                setEditingSchedule(null)
                setShowSuccessModal(true)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al guardar horario", description: errorData.error || "Ocurrió un error inesperado." })
            }
        } catch (error) {
            console.error("Error saving", error)
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsScheduleLoading(false)
        }
    }

    const handleDeleteSchedule = (scheduleItem) => {
        setConfirmAction({ type: 'delete_schedule', data: scheduleItem })
    }

    const handleClearSchedule = () => {
        setConfirmAction({ type: 'clear_schedule' })
    }

    const handleClearDay = (day) => {
        setConfirmAction({ type: 'clear_day', data: day })
    }

    const executeConfirmAction = async () => {
        if (!confirmAction) return

        try {
            if (confirmAction.type === 'delete_schedule') {
                const scheduleItem = confirmAction.data
                const res = await fetch(`/api/schedules/${scheduleItem.id}`, { method: 'DELETE' })
                if (res.ok) {
                    setGroupSchedule(prev => prev.filter(s => s.id !== scheduleItem.id))
                } else {
                    const data = await res.json()
                    setErrorDialog({ isOpen: true, title: "Error al eliminar clase", description: data.error || "Error inesperado." })
                }
            } else if (confirmAction.type === 'clear_schedule') {
                const res = await fetch(`/api/schedules/group/${selectedGroup.id}`, { method: 'DELETE' })
                if (res.ok) {
                    setGroupSchedule([])
                } else {
                    const data = await res.json()
                    setErrorDialog({ isOpen: true, title: "Error al vaciar horario", description: data.error || "Error inesperado." })
                }
            } else if (confirmAction.type === 'clear_day') {
                const day = confirmAction.data
                const res = await fetch(`/api/schedules/group/${selectedGroup.id}/day/${day}`, { method: 'DELETE' })
                if (res.ok) {
                    setGroupSchedule(prev => prev.filter(s => s.day !== day))
                } else {
                    const data = await res.json()
                    setErrorDialog({ isOpen: true, title: "Error al limpiar día", description: data.error || "Error inesperado." })
                }
            }
        } catch (error) { console.error(error); setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." }) }
        setConfirmAction(null)
    }

    const handlePrintPDF = () => {
        if (!selectedGroup) return

        const doc = new jsPDF()

        // Encabezado
        doc.setFontSize(18)
        doc.text(`Horario de Clases - ${selectedGroup.name}`, 14, 22)

        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Nivel: ${selectedLevelName} | Alumnos: ${selectedGroup.student_count} | Titular: ${selectedGroup.teacher_name || "Sin asignar"}`, 14, 30)

        // Preparar datos para la tabla
        const tableColumn = ["Hora", ...days]
        const tableRows = []

        timeSlots.forEach(slot => {
            const row = [slot]
            days.forEach(day => {
                const classInfo = groupSchedule.find(s => s.day === day && s.time === slot)
                row.push(classInfo ? `${classInfo.subject_name}\n${classInfo.teacher || ''}` : "")
            })
            tableRows.push(row)
        })

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 2, valign: 'middle', halign: 'center' },
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25, fillColor: [245, 247, 250] } },
            theme: 'grid'
        })

        doc.save(`horario_${selectedLevelName.replace(/\s+/g, '_').toLowerCase()}_${selectedGroup.name.replace(/\s+/g, '_').toLowerCase()}.pdf`)
    }

    return (
        <div className="space-y-6">
            {(isLoading || isScheduleLoading) && <LoadingOverlay message="Procesando horarios..." />}
            
            {/* Level Selection */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Gestión de Horarios por Nivel Académico</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        {academicLevels.map(level => (
                            <Button
                                key={level.id}
                                onClick={() => {
                                    setSelectedLevel(level.slug)
                                    setSelectedGroup(null)
                                }}
                                className={selectedLevel === level.slug ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"}
                            >
                                {level.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Groups List */}
                <Card className="lg:col-span-1 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Grupos de {selectedLevelName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200">
                            {filteredGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedGroup?.id === group.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-slate-900">{group.name}</div>
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                            {group.student_count} alumnos
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-slate-600 mt-2">{group.teacher_name || "Sin asignar"}</div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <CalendarClock className="h-3 w-3 text-slate-400" />
                                        <span className="text-xs text-slate-500">{groupSchedule.length} clases programadas</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Group Detail & Schedule */}
                <Card className="lg:col-span-2 border-slate-200">
                    {selectedGroup ? (
                        <>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Horario del Grupo {selectedGroup.name}</CardTitle>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {selectedGroup.student_count} alumnos • {selectedGroup.teacher_name || "Sin asignar"}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handlePrintPDF}
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                            <Printer className="h-4 w-4 mr-2" />
                                            Imprimir PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleClearSchedule}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Vaciar Horario
                                        </Button>
                                        <Button
                                            onClick={handleAddSchedule}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Clase
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {groupSchedule.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Schedule by Day */}
                                        {days.map((day) => {
                                            const daySchedule = groupSchedule
                                                .filter((item) => item.day === day)
                                                .sort((a, b) => {
                                                    const startA = parseInt(a.time.split('-')[0].replace(':', ''))
                                                    const startB = parseInt(b.time.split('-')[0].replace(':', ''))
                                                    return startA - startB
                                                })
                                            if (daySchedule.length === 0) return null
                                            
                                            return (
                                                <div key={day} className="border border-slate-200 rounded-lg overflow-hidden">
                                                    <div className="bg-blue-600 text-white px-4 py-2 font-medium flex justify-between items-center">
                                                        <span>{day}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-white hover:bg-blue-700 hover:text-white"
                                                            onClick={() => handleClearDay(day)}
                                                            title="Vaciar día"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="divide-y divide-slate-200">
                                                        {daySchedule.map((schedule, idx) => (
                                                            <div
                                                                key={schedule.id}
                                                                className="p-4 hover:bg-slate-50 flex items-center justify-between"
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                                                                            {schedule.time}
                                                                        </Badge>
                                                                        <span className="font-medium text-slate-900">{schedule.subject_name}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 mt-1">{schedule.teacher}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleEditSchedule(schedule)}
                                                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleDeleteSchedule(schedule)}
                                                                        className="border-red-200 text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Weekly Summary */}
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-emerald-800">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span className="font-medium">
                                                    Total: {groupSchedule.length} clases programadas esta semana
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <CalendarClock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay clases programadas</h3>
                                        <p className="text-slate-500 mb-6">
                                            Comienza agregando las primeras clases para este grupo
                                        </p>
                                        <Button
                                            onClick={handleAddSchedule}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Primera Clase
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex items-center justify-center h-full py-12">
                            <div className="text-center">
                                <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Selecciona un grupo</h3>
                                <p className="text-slate-500">Elige un grupo de la lista para ver y editar su horario</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule?.id ? "Editar Clase" : "Agregar Nueva Clase"}</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de la clase para el grupo {selectedGroup?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Día de la Semana</Label>
                            <ReactSelect
                                instanceId="day-select"
                                options={dayOptions}
                                value={dayOptions.find(d => d.value === editingSchedule?.day)}
                                onChange={(option) => setEditingSchedule({ ...editingSchedule, day: option.value })}
                                placeholder="Selecciona el día"
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>

                        <div>
                            <Label>Horario</Label>
                            <ReactSelect
                                instanceId="time-select"
                                options={timeSlotOptions}
                                value={timeSlotOptions.find(s => s.value === editingSchedule?.time)}
                                onChange={(option) => setEditingSchedule({ ...editingSchedule, time: option.value })}
                                placeholder="Selecciona el horario"
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>

                        <div>
                            <Label>Materia</Label>
                            <ReactSelect
                                instanceId="subject-select"
                                options={subjectOptions}
                                value={subjectOptions.find(s => s.value === editingSchedule?.subject_id?.toString())}
                                onChange={(option) => setEditingSchedule({ ...editingSchedule, subject_id: option.value })}
                                placeholder="Selecciona la materia"
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>

                        <div>
                            <Label>Profesor</Label>
                            <ReactSelect
                                instanceId="teacher-select"
                                options={teacherOptions}
                                value={teacherOptions.find(t => t.value === editingSchedule?.teacher_id?.toString())}
                                onChange={(option) => setEditingSchedule({ ...editingSchedule, teacher_id: option.value })}
                                placeholder="Selecciona el profesor"
                                menuPosition="fixed"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} className="border-slate-200">
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveSchedule} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Guardar Clase
                        </Button>
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

            {/* Confirmation Dialog */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar acción</DialogTitle>
                        <DialogDescription>
                            {confirmAction?.type === 'delete_schedule' && "¿Estás seguro de eliminar esta clase?"}
                            {confirmAction?.type === 'clear_schedule' && `¿Estás seguro de eliminar TODO el horario del grupo ${selectedGroup?.name}? Esta acción no se puede deshacer.`}
                            {confirmAction?.type === 'clear_day' && `¿Estás seguro de eliminar todas las clases del día ${confirmAction?.data}?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={executeConfirmAction}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SuccessModal 
                open={showSuccessModal} 
                onOpenChange={setShowSuccessModal} 
                description="El horario ha sido guardado correctamente." 
            />
        </div>
    )
}
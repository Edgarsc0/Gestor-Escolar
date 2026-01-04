import { useState, useEffect } from "react"
import ReactSelect from "react-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function GroupFormDialog({ isOpen, onClose, onSave, group, teachers, academicLevels }) {
    const [selectedTeacher, setSelectedTeacher] = useState(null)
    const [selectedLevel, setSelectedLevel] = useState(null)

    useEffect(() => {
        if (isOpen) {
            if (group) {
                let teacherOption = null
                if (group.main_teacher_id) {
                    const teacher = teachers.find(t => t.id === group.main_teacher_id)
                    if (teacher) {
                        teacherOption = { value: teacher.id.toString(), label: teacher.full_name }
                    } else if (group.teacher_name) {
                        teacherOption = { value: group.main_teacher_id.toString(), label: group.teacher_name }
                    }
                }
                setSelectedTeacher(teacherOption)
                const level = academicLevels.find(l => l.slug === group.level_slug)
                setSelectedLevel(level ? { value: level.slug, label: level.name } : null)
            } else {
                setSelectedTeacher(null)
                setSelectedLevel(null)
            }
        }
    }, [isOpen, group, teachers, academicLevels])

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        onSave(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{group ? "Editar Grupo" : "Nuevo Grupo"}</DialogTitle>
                    <DialogDescription>
                        Configure los detalles del grupo académico y su asignación.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Grupo</Label>
                        <Input id="name" name="name" defaultValue={group?.name} placeholder="Ej. 1-A" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="level">Nivel Educativo</Label>
                        <ReactSelect
                            instanceId="level-select"
                            options={academicLevels.map(l => ({ value: l.slug, label: l.name }))}
                            value={selectedLevel}
                            onChange={setSelectedLevel}
                            placeholder="Seleccione nivel..."
                            isClearable
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                        />
                        <input type="hidden" name="level" value={selectedLevel?.value || ""} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="teacher">Docente Titular</Label>
                        <ReactSelect
                            instanceId="teacher-select"
                            options={teachers.map(t => ({ value: t.id.toString(), label: t.full_name }))}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            placeholder="Buscar o seleccionar docente..."
                            isClearable
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }) }}
                        />
                        <input type="hidden" name="teacher" value={selectedTeacher?.value || ""} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacidad de Alumnos</Label>
                        <Input id="capacity" name="capacity" type="number" defaultValue={group?.capacity || 30} />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
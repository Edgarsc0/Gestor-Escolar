import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Check } from "lucide-react"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"

const levelHierarchy = ['kinder', 'primaria', 'secundaria', 'preparatoria', 'bachillerato'];

export function EnrollmentDialog({ isOpen, onClose, group, onEnroll, currentStudentIds }) {
    const [availableStudents, setAvailableStudents] = useState([])
    const [studentsWithGroup, setStudentsWithGroup] = useState([])
    const [enrollSelection, setEnrollSelection] = useState([])
    const [enrollSearch, setEnrollSearch] = useState("")
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        if (isOpen && group) {
            fetchData()
            setEnrollSelection([])
            setEnrollSearch("")
        }
    }, [isOpen, group])

    const fetchData = async () => {
        setIsFetching(true)
        try {
            const [usersRes, enrollmentsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/groups/enrollments')
            ])

            if (usersRes.ok && enrollmentsRes.ok) {
                const allUsers = await usersRes.json()
                const enrollments = await enrollmentsRes.json()
                const enrollmentMap = new Map()
                
                enrollments.forEach(e => enrollmentMap.set(String(e.student_id), { 
                    id: e.group_id, name: e.group_name, level_name: e.level_name, level_slug: e.level_slug
                }))

                const allStudents = allUsers.filter(u => (u.role === 'student' || u._role === 'student') && u.status === 'active')
                const currentIdsSet = new Set(currentStudentIds.map(id => String(id)))

                const available = []
                const occupied = []
                const targetLevelIndex = levelHierarchy.indexOf(group.level_slug);

                allStudents.forEach(s => {
                    const sId = String(s.id)
                    if (currentIdsSet.has(sId)) return
                    if (enrollmentMap.has(sId)) {
                        const groupInfo = enrollmentMap.get(sId)
                        const studentLevelIndex = levelHierarchy.indexOf(groupInfo.level_slug);
                        if (targetLevelIndex > -1 && studentLevelIndex > -1 && studentLevelIndex >= targetLevelIndex - 1 && studentLevelIndex <= targetLevelIndex) {
                            occupied.push({ 
                                ...s, other_group_id: groupInfo.id, other_group_name: groupInfo.name,
                                other_level_name: groupInfo.level_name, other_level_slug: groupInfo.level_slug
                            })
                        }
                    } else {
                        available.push(s)
                    }
                })
                setAvailableStudents(available)
                setStudentsWithGroup(occupied)
            }
        } catch (error) {
            console.error("Error fetching enrollment data:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const toggleSelection = (id) => {
        setEnrollSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleConfirm = () => {
        
        const studentsMoving = studentsWithGroup.filter(s => enrollSelection.includes(s.id))
        const leavingCounts = {}
        studentsMoving.forEach(s => {
            if (s.other_group_id) leavingCounts[s.other_group_id] = (leavingCounts[s.other_group_id] || 0) + 1
        })
        onEnroll(enrollSelection, leavingCounts)
    }

    const getLevelBadgeColor = (slug) => {
        const colors = { kinder: "bg-pink-500", primaria: "bg-blue-500", secundaria: "bg-purple-500", preparatoria: "bg-orange-500", bachillerato: "bg-orange-500" }
        return colors[slug] || "bg-slate-500"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                {isFetching && <LoadingOverlay message="Cargando alumnos..." />}
                <DialogHeader>
                    <DialogTitle>Inscribir Alumnos al Grupo {group?.name}</DialogTitle>
                    <DialogDescription>
                        Selecciona los alumnos. {studentsWithGroup.length > 0 && "⚠️ Alumnos de otros grupos serán movidos."}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Buscar..." className="pl-8" value={enrollSearch} onChange={(e) => setEnrollSearch(e.target.value)} />
                    </div>
                    <div className="border rounded-md flex-1 overflow-auto p-2 space-y-1">
                        {/* Disponibles */}
                        {availableStudents.length > 0 && <div className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-50 rounded">Disponibles ({availableStudents.length})</div>}
                        {availableStudents.filter(s => (s.full_name || "").toLowerCase().includes(enrollSearch.toLowerCase())).map(s => (
                            <StudentItem key={s.id} student={s} selected={enrollSelection.includes(s.id)} onToggle={() => toggleSelection(s.id)} />
                        ))}
                        {/* Ocupados */}
                        {studentsWithGroup.length > 0 && <div className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-50 rounded mt-4">En otros grupos ({studentsWithGroup.length})</div>}
                        {studentsWithGroup.filter(s => (s.full_name || "").toLowerCase().includes(enrollSearch.toLowerCase())).map(s => (
                            <StudentItem key={s.id} student={s} selected={enrollSelection.includes(s.id)} onToggle={() => toggleSelection(s.id)} 
                                extra={<div className="flex gap-2"><Badge variant="outline">{s.other_group_name}</Badge><Badge className={`text-[10px] h-5 ${getLevelBadgeColor(s.other_level_slug)}`}>{s.other_level_name}</Badge></div>} 
                            />
                        ))}
                    </div>
                    <div className="text-sm text-slate-500">{enrollSelection.length} seleccionados</div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={enrollSelection.length === 0} className="bg-blue-600 hover:bg-blue-700">Inscribir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StudentItem({ student, selected, onToggle, extra }) {
    return (
        <div 
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border mb-1 ${selected ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50 border-transparent"}`}
            onClick={onToggle}
        >
            <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}>
                    {selected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <div>
                    <div className="font-medium text-slate-700 text-sm">{student.full_name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                </div>
            </div>
            {extra}
        </div>
    )
}
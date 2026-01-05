"use client"

import { useState, useEffect, Fragment } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/useAuth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Layers, ChevronDown, ChevronUp, Save, Loader2, CalendarDays, BookCopy, FileText, Search, AlertTriangle, UserCheck, Check, X, Clock, FileDown } from "lucide-react"
import TutorInformation from "./TutorInformation" 
import { SuccessModal } from "./SuccessDialog"
import { LoadingOverlay } from "./LoadingOverlay"
import { Badge } from "../ui/badge"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ReactSelect from "react-select"

const evaluationPeriods = ["Parcial 1", "Parcial 2", "Parcial 3", "Final"];
const incidentTypes = [
    { value: 'Falta', label: 'Falta' },
    { value: 'Retardo', label: 'Retardo' },
    { value: 'Conducta', label: 'Conducta' },
    { value: 'Uniforme', label: 'Uniforme' }
];
const periodToDbKey = {
    'parcial1': 'partial_1',
    'parcial2': 'partial_2',
    'parcial3': 'partial_3',
    'final': 'final_grade'
};
const timeSlots = [
    "07:00-8:00",
    "8:00-9:00",
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const normalizeTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m.substring(0, 2)}`;
};

function TeacherScheduleGrid({ schedule }) {

    console.log(schedule);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-6 gap-2">
                    <div className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center">Hora</div>
                    {days.map((day) => (
                        <div key={day} className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center">{day}</div>
                    ))}
                    {timeSlots.map((time, timeIndex) => (
                        <Fragment key={time}>
                            <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg flex items-center justify-center font-medium">{time}</div>
                            {days.map((day) => {
                                
                                const classInfo = schedule.find(s => {
                                    if (s.day_of_week !== day) return false;
                                    const [slotStart, slotEnd] = time.split("-");
                                    return normalizeTime(s.start_time) === normalizeTime(slotStart) && 
                                           normalizeTime(s.end_time) === normalizeTime(slotEnd);
                                });

                                return (
                                    <div key={`${day}-${timeIndex}`} className={`p-3 rounded-lg border-l-4 ${classInfo ? "bg-blue-50 text-blue-900 border-l-blue-500" : 'bg-white'}`}>
                                        {classInfo ? (
                                            <>
                                                <div className="font-semibold text-sm mb-1">{classInfo.subject_name}</div>
                                                <div className="text-xs opacity-90">{classInfo.group_name}</div>
                                            </>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TeacherMain() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('view') || "groups";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [groups, setGroups] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reportedIncidents, setReportedIncidents] = useState([]);
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    
    const [isSavingGrades, setIsSavingGrades] = useState(false);

    const [selectedGroupForGrading, setSelectedGroupForGrading] = useState(null);
    const [subjectsForGrading, setSubjectsForGrading] = useState([]);
    const [selectedSubjectForGrading, setSelectedSubjectForGrading] = useState(null);
    const [expandedGradeCard, setExpandedGradeCard] = useState(null);
    const [studentsForGrading, setStudentsForGrading] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" });
    const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
    const [incidentData, setIncidentData] = useState({ studentId: null, studentName: "" });
    const [incidentForm, setIncidentForm] = useState({ type: null, date: '', description: '' });
    const [isSavingIncident, setIsSavingIncident] = useState(false);

    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassForAttendance, setSelectedClassForAttendance] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);
    const [attendanceViewMode, setAttendanceViewMode] = useState('day');

    useEffect(() => {
        const view = searchParams.get('view');
        if (view) setActiveTab(view);
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [groupsRes, scheduleRes] = await Promise.all([
                    fetch(`/api/groups/teacher/${user.id}`),
                    fetch(`/api/schedules/teacher/${user.id}`)
                ]);

                if (groupsRes.ok) {
                    const groupsData = await groupsRes.json();
                    
                    const groupsWithStudents = await Promise.all(groupsData.map(async (group) => {
                        const studentsRes = await fetch(`/api/groups/${group.id}/students`);
                        const students = studentsRes.ok ? await studentsRes.json() : [];
                        return { ...group, students, student_count: students.length };
                    }));
                    setGroups(groupsWithStudents);
                }
                if (scheduleRes.ok) setSchedule(await scheduleRes.json());

            } catch (error) {
                console.error("Error fetching teacher data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchData();
        } else {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [user]);

    useEffect(() => {
        const uniqueSubjects = schedule.reduce((acc, current) => {
            if (!acc.find(item => item.subject_id === current.subject_id)) {
                acc.push({ 
                    subject_id: current.subject_id, 
                    subject_name: current.subject_name,
                    groups: schedule
                        .filter(s => s.subject_id === current.subject_id)
                        .map(s => {
                            const fullGroup = groups.find(g => g.id === s.group_id);
                            return { id: s.group_id, name: s.group_name, level_name: fullGroup?.level_name };
                        })
                        .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) 
                });
            }
            return acc;
        }, []);
        setSubjectsForGrading(uniqueSubjects);
    }, [schedule, groups]);

    useEffect(() => {
        if (selectedGroupForGrading && selectedSubjectForGrading) {
            const fetchGrades = async () => {
                const res = await fetch(`/api/grades?group_id=${selectedGroupForGrading.value}&subject_id=${selectedSubjectForGrading.value}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudentsForGrading(data);
                }
            };
            fetchGrades();
        }
    }, [selectedGroupForGrading, selectedSubjectForGrading]);

    useEffect(() => {
        if (activeTab === 'incidents' && user?.id) {
            const fetchIncidents = async () => {
                try {
                    const res = await fetch(`/api/incidents?reporter_id=${user.id}`);
                    if (res.ok) {
                        setReportedIncidents(await res.json());
                    }
                } catch (error) {
                    console.error("Error fetching incidents:", error);
                }
            };
            fetchIncidents();
        }
    }, [activeTab, user]);


    const toggleGroupExpansion = (groupId) => {
        setExpandedGroupId(prevId => (prevId === groupId ? null : groupId));
        setStudentSearchQuery("");
    };

    const handleGradeChange = (studentId, dbKey, value) => {
        const grade = parseFloat(value);
        const finalValue = value === '' ? null : isNaN(grade) ? null : Math.min(grade, 10);

        setStudentsForGrading(prev => prev.map(student => {
            if (student.student_id !== studentId) {
                return student;
            }

            const updatedStudent = { ...student, [dbKey]: finalValue };

            const p1 = parseFloat(updatedStudent.partial_1);
            const p2 = parseFloat(updatedStudent.partial_2);
            const p3 = parseFloat(updatedStudent.partial_3);

            if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
                const avg = (p1 + p2 + p3) / 3;
                updatedStudent.final_grade = parseFloat(avg.toFixed(2));
            } else if (dbKey !== 'final_grade') {
                updatedStudent.final_grade = null;
            }

            return updatedStudent;
        }));
    };

    const handleSaveChanges = async () => {
        setIsSavingGrades(true);
        setSuccessMessage("Las calificaciones han sido guardadas correctamente.");
        const payload = studentsForGrading.map(s => ({
            student_id: s.student_id,
            subject_id: selectedSubjectForGrading.value,
            group_id: selectedGroupForGrading.value,
            partial_1: s.partial_1,
            partial_2: s.partial_2,
            partial_3: s.partial_3,
            final_grade: s.final_grade,
        }));

        console.log(payload);

        await fetch('/api/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setIsSavingGrades(false);
        setShowSuccessDialog(true);
        setTimeout(() => { 
            setShowSuccessDialog(false);
        }, 2000); 
    };

    const handleOpenIncidentDialog = (student) => {
        setIncidentData({ studentId: student.id, studentName: student.full_name });
        setIncidentForm({ type: null, date: new Date().toISOString().split('T')[0], description: '' });
        setIsIncidentDialogOpen(true);
    };

    const handleSaveIncident = async () => {
        if (!incidentForm.type || !incidentForm.date) {
            setErrorDialog({ isOpen: true, title: "Campos incompletos", description: "Por favor, selecciona el tipo y la fecha de la incidencia." });
            return;
        }

        setIsSavingIncident(true);
        try {
            const payload = {
                student_id: incidentData.studentId,
                reporter_id: user.id,
                type: incidentForm.type.value,
                date: incidentForm.date,
                description: incidentForm.description,
            };

            const res = await fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                setIsIncidentDialogOpen(false);
                setSuccessMessage("La incidencia ha sido reportada correctamente.");
                setShowSuccessDialog(true);
            } else {
                const errorData = await res.json();
                setErrorDialog({ isOpen: true, title: "Error al reportar incidencia", description: errorData.error || "No se pudo guardar la incidencia." });
            }
        } catch (error) {
            setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo conectar con el servidor." });
        } finally {
            setIsSavingIncident(false);
        }
    };

    const handleGeneratePDF = () => {
        const subject = subjectsForGrading.find(s => s.subject_id === selectedSubjectForGrading.value);
        const group = subject?.groups.find(g => g.id === selectedGroupForGrading.value);

        if (!subject || !group) return;

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Reporte de Calificaciones", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        
        doc.text(`Materia: ${subject.subject_name}`, 14, 32);
        doc.text(`Grupo: ${group.name} - ${group.level_name || ''}`, 14, 38);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 44);

        const tableColumn = ["Nombre del Alumno", "Parcial 1", "Parcial 2", "Parcial 3", "Promedio Final"];
        const tableRows = studentsForGrading.map(student => [
            student.full_name,
            student.partial_1 ?? "-",
            student.partial_2 ?? "-",
            student.partial_3 ?? "-",
            student.final_grade ?? "-"
        ]);

        autoTable(doc, {
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: 255 }, 
        });

        doc.save(`Reporte_${subject.subject_name.replace(/\s+/g, '_')}_${group.name}.pdf`);
    };

    const handleExportSchedulePDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        doc.setFontSize(18);
        doc.text("Horario de Clases", 14, 22);
        doc.setFontSize(11);
        doc.text(`Docente: ${user?.full_name || 'N/A'}`, 14, 30);

        const tableColumn = ["Hora", ...days];
        const tableRows = [];

        timeSlots.forEach(slot => {
            const row = [slot];
            days.forEach(day => {
                const [slotStart, slotEnd] = slot.split("-");
                
                const classInfo = schedule.find(s => {
                    if (s.day_of_week !== day) return false;
                    return normalizeTime(s.start_time) === normalizeTime(slotStart) && 
                           normalizeTime(s.end_time) === normalizeTime(slotEnd);
                });

                row.push(classInfo ? `${classInfo.subject_name}\n${classInfo.group_name}` : "");
            });
            tableRows.push(row);
        });

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4, halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        });

        doc.save("Mi_Horario.pdf");
    };

    const handleCardClick = (subjectId, groupId) => {
        const cardKey = `${subjectId}-${groupId}`;
        if (expandedGradeCard === cardKey) {
            setExpandedGradeCard(null); 
            setStudentSearchQuery("");
        } else {
            setSelectedGroupForGrading({ value: groupId });
            setSelectedSubjectForGrading({ value: subjectId });
            setExpandedGradeCard(cardKey);
            setStudentSearchQuery("");
        }
    };

    const getDayName = (dateStr) => {
        const date = new Date(dateStr + 'T12:00:00'); 
        const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        return days[date.getDay()];
    }

    const handleClassSelectForAttendance = async (classItem) => {
        setSelectedClassForAttendance(classItem);
        setIsLoading(true);
        try {
            const group = groups.find(g => g.id === classItem.group_id);
            
            // Si el grupo no está cargado en 'groups' (por alguna razón), intentamos buscarlo o fallamos
            // Asumimos que 'groups' tiene todos los grupos del profesor con sus estudiantes cargados
            
            const res = await fetch(`/api/attendance?group_id=${classItem.group_id}&subject_id=${classItem.subject_id}&date=${attendanceDate}`);
            let existingAttendance = [];
            if (res.ok) {
                existingAttendance = await res.json();
            }

            const studentsList = group ? group.students : [];
            
            const initialList = studentsList.map(student => {
                const existing = existingAttendance.find(a => a.student_id === student.id);
                return {
                    student_id: student.id,
                    student_name: student.full_name,
                    status: existing ? existing.status : 'presente'
                };
            });
            
            setAttendanceList(initialList.sort((a, b) => a.student_name.localeCompare(b.student_name)));
        } catch (e) {
            console.error(e);
            setErrorDialog({ isOpen: true, title: "Error", description: "No se pudo cargar la lista de asistencia." });
        } finally {
            setIsLoading(false);
        }
    }

    const setAttendanceStatus = (studentId, status) => {
        setAttendanceList(prev => prev.map(item => item.student_id === studentId ? { ...item, status } : item));
    }

    const markAllAttendance = (status) => {
        setAttendanceList(prev => prev.map(item => ({ ...item, status })));
    }

    const saveAttendance = async () => {
        setIsSavingAttendance(true);
        try {
            const payload = {
                teacher_id: user.id,
                group_id: selectedClassForAttendance.group_id,
                subject_id: selectedClassForAttendance.subject_id,
                date: attendanceDate,
                students: attendanceList.map(a => ({ student_id: a.student_id, status: a.status }))
            };
            
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setSuccessMessage("Asistencia guardada correctamente");
                setShowSuccessDialog(true);
                setSelectedClassForAttendance(null);
            } else {
                throw new Error("Error al guardar");
            }
        } catch(e) {
            setErrorDialog({ isOpen: true, title: "Error", description: "No se pudo guardar la asistencia." });
        } finally {
            setIsSavingAttendance(false);
        }
    }

    const handleDownloadTeacherReport = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/attendance?teacher_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    setErrorDialog({ isOpen: true, title: "Sin datos", description: "No hay registros de asistencia para descargar." });
                    return;
                }
                
                const headers = ["Fecha", "Grupo", "Materia", "Alumno", "Estado"];
                const rows = data.map(item => [
                    new Date(item.date).toLocaleDateString('es-MX'),
                    item.group_name || "Sin grupo",
                    item.subject_name || "Sin materia",
                    item.student_name || "Desconocido",
                    item.status
                ]);
                
                const csvContent = [
                    headers.join(","),
                    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
                ].join("\n");
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Reporte_General_Asistencia_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            setErrorDialog({ isOpen: true, title: "Error", description: "No se pudo descargar el reporte." });
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 pt-10">
            {(isLoading || isSavingGrades || isSavingAttendance) && <LoadingOverlay message={isSavingGrades ? "Guardando calificaciones..." : isSavingAttendance ? "Guardando asistencia..." : "Cargando panel docente..."} />}
            
            <div className="max-w-7xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6 max-w-5xl mx-auto">
                        <TabsTrigger value="groups">Mis Grupos</TabsTrigger>
                        <TabsTrigger value="schedule">Mi Horario</TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                        <TabsTrigger value="grades">Calificaciones</TabsTrigger>
                        <TabsTrigger value="incidents">Incidencias</TabsTrigger>
                        <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-blue-600" />
                                    Grupos Asignados
                                </CardTitle>
                                <CardDescription>Visualiza los alumnos inscritos en cada uno de tus grupos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {groups.map(group => (
                                    <Card key={group.id} className="overflow-hidden">
                                        <div 
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                                            onClick={() => toggleGroupExpansion(group.id)}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Badge variant="outline">{group.level_name}</Badge>
                                                    <span>{group.student_count} alumnos</span>
                                                </div>
                                            </div>
                                            {expandedGroupId === group.id ? <ChevronUp /> : <ChevronDown />}
                                        </div>

                                        {expandedGroupId === group.id && (
                                            <div className="p-4 bg-slate-50/50 border-t">
                                                <div className="relative mb-4 max-w-sm">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Buscar alumno..."
                                                        value={studentSearchQuery}
                                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                        className="pl-8 bg-white"
                                                    />
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nombre del Alumno</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead className="text-right">Acciones</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {group.students
                                                            .filter(student => student.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                                                            .map(student => (
                                                            <TableRow key={student.id}>
                                                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                                                <TableCell>{student.email}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button variant="outline" size="sm" onClick={() => handleOpenIncidentDialog(student)} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                                        Emitir una incidencia
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-blue-600" />
                                        Mi Horario de Clases
                                    </CardTitle>
                                    <CardDescription>Tu horario semanal de clases asignadas.</CardDescription>
                                </div>
                                <Button variant="outline" onClick={handleExportSchedulePDF} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Exportar PDF
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <TeacherScheduleGrid schedule={schedule} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-blue-600" />
                                            Pase de Lista
                                        </CardTitle>
                                        <CardDescription>Registra la asistencia de tus grupos de manera rápida.</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={handleDownloadTeacherReport} className="gap-2 text-slate-600">
                                        <FileDown className="h-4 w-4" />
                                        Reporte General
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!selectedClassForAttendance ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-center space-x-4">
                                            <Button 
                                                variant={attendanceViewMode === 'day' ? "default" : "outline"}
                                                onClick={() => setAttendanceViewMode('day')}
                                                className="w-40"
                                            >
                                                Por Día
                                            </Button>
                                            <Button 
                                                variant={attendanceViewMode === 'all' ? "default" : "outline"}
                                                onClick={() => setAttendanceViewMode('all')}
                                                className="w-40"
                                            >
                                                Todas las Clases
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <Label className="whitespace-nowrap">Fecha de Asistencia:</Label>
                                            <Input 
                                                type="date" 
                                                value={attendanceDate} 
                                                onChange={(e) => setAttendanceDate(e.target.value)}
                                                className="w-auto bg-white"
                                            />
                                            <Badge variant="outline" className="ml-2">
                                                {getDayName(attendanceDate)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {(attendanceViewMode === 'day' 
                                                ? schedule.filter(s => s.day_of_week === getDayName(attendanceDate))
                                                : schedule
                                            ).map((classItem, idx) => {
                                                const group = groups.find(g => g.id === classItem.group_id);
                                                return (
                                                <Card 
                                                    key={idx} 
                                                    className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
                                                    onClick={() => handleClassSelectForAttendance(classItem)}
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <Badge>{classItem.start_time.substring(0, 5)} - {classItem.end_time.substring(0, 5)}</Badge>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <Badge variant="outline">{classItem.group_name}</Badge>
                                                                {group?.level_name && (
                                                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                                                        {group.level_name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-bold text-lg text-slate-800 mb-1">{classItem.subject_name}</h3>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-sm text-slate-500">Click para pasar lista</p>
                                                            {attendanceViewMode === 'all' && (
                                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                                                    {classItem.day_of_week}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )})}
                                            {attendanceViewMode === 'day' && schedule.filter(s => s.day_of_week === getDayName(attendanceDate)).length === 0 && (
                                                <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                                                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                    <p>No hay clases programadas para este día.</p>
                                                </div>
                                            )}
                                            {attendanceViewMode === 'all' && schedule.length === 0 && (
                                                <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                                                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                    <p>No tienes clases asignadas.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <div>
                                                <h3 className="font-bold text-lg">{selectedClassForAttendance.subject_name} - {selectedClassForAttendance.group_name}</h3>
                                                <p className="text-sm text-slate-500">{getDayName(attendanceDate)}, {attendanceDate}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setSelectedClassForAttendance(null)}>Cancelar</Button>
                                                <Button onClick={saveAttendance} className="bg-blue-600 hover:bg-blue-700">Guardar Asistencia</Button>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-slate-100 p-2 flex justify-end gap-2 border-b">
                                                <span className="text-xs font-medium text-slate-500 self-center mr-2">Marcar todos como:</span>
                                                <Button size="sm" variant="outline" onClick={() => markAllAttendance('presente')} className="h-7 text-xs bg-white text-green-700 border-green-200 hover:bg-green-50">Presente</Button>
                                                <Button size="sm" variant="outline" onClick={() => markAllAttendance('retardo')} className="h-7 text-xs bg-white text-amber-700 border-amber-200 hover:bg-amber-50">Retardo</Button>
                                                <Button size="sm" variant="outline" onClick={() => markAllAttendance('falta')} className="h-7 text-xs bg-white text-red-700 border-red-200 hover:bg-red-50">Falta</Button>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Alumno</TableHead>
                                                        <TableHead className="text-center w-[300px]">Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {attendanceList.map((student) => (
                                                        <TableRow key={student.student_id}>
                                                            <TableCell className="font-medium">{student.student_name}</TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    <Button size="sm" variant={student.status === 'presente' ? "default" : "outline"} onClick={() => setAttendanceStatus(student.student_id, 'presente')} className={`w-24 ${student.status === 'presente' ? 'bg-green-600 hover:bg-green-700' : 'text-slate-500'}`}><Check className="h-3 w-3 mr-1" /> Presente</Button>
                                                                    <Button size="sm" variant={student.status === 'retardo' ? "default" : "outline"} onClick={() => setAttendanceStatus(student.student_id, 'retardo')} className={`w-24 ${student.status === 'retardo' ? 'bg-amber-500 hover:bg-amber-600' : 'text-slate-500'}`}><Clock className="h-3 w-3 mr-1" /> Retardo</Button>
                                                                    <Button size="sm" variant={student.status === 'falta' ? "default" : "outline"} onClick={() => setAttendanceStatus(student.student_id, 'falta')} className={`w-24 ${student.status === 'falta' ? 'bg-red-600 hover:bg-red-700' : 'text-slate-500'}`}><X className="h-3 w-3 mr-1" /> Falta</Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="grades" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookCopy className="h-5 w-5 text-blue-600" />
                                    Registro de Calificaciones
                                </CardTitle>
                                <CardDescription>Selecciona un grupo para registrar o modificar calificaciones.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {subjectsForGrading.map(subject => (
                                    <div key={subject.subject_id}>
                                        <h3 className="font-semibold text-slate-800 mb-2">{subject.subject_name}</h3>
                                        <div className="space-y-4">
                                            {subject.groups.map(group => {
                                                const cardKey = `${subject.subject_id}-${group.id}`;
                                                const isExpanded = expandedGradeCard === cardKey;
                                                return (
                                                    <Card key={cardKey} className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-md ring-1 ring-blue-100' : 'shadow-sm hover:shadow'}`}>
                                                        <div 
                                                            className={`p-5 cursor-pointer border-l-4 ${isExpanded ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 bg-white'}`}
                                                            onClick={() => handleCardClick(subject.subject_id, group.id)}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                        <Layers className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className={`font-bold text-lg ${isExpanded ? 'text-blue-900' : 'text-slate-700'}`}>{group.name}</h4>
                                                                            <Badge variant="outline" className="text-xs">{group.level_name}</Badge>
                                                                        </div>
                                                                        <p className="text-sm text-slate-500">{isExpanded ? 'Gestionando calificaciones' : 'Click para desplegar lista de alumnos'}</p>
                                                                    </div>
                                                                </div>
                                                                {isExpanded ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-400" />}
                                                            </div>
                                                        </div>
                                                        {isExpanded && (
                                                            <div className="p-4 border-t">
                                                                {studentsForGrading.length > 0 ? (
                                                                    <>
                                        <div className="relative mb-4 max-w-sm">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Buscar alumno..."
                                                value={studentSearchQuery}
                                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                className="pl-8 bg-white"
                                            />
                                        </div>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[300px]">Nombre del Alumno</TableHead>
                                                        {evaluationPeriods.map(period => (
                                                            <TableHead key={`header-${period}`}>{period}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {studentsForGrading
                                                        .filter(student => student.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                                                        .map(student => (
                                                        <TableRow key={student.student_id}>
                                                            <TableCell className="font-medium">{student.full_name}</TableCell>
                                                            {evaluationPeriods.map(period => {
                                                                const periodKey = period.replace(/\s+/g, '').toLowerCase();
                                                                const dbKey = periodToDbKey[periodKey];
                                                                const isFinalGradeColumn = dbKey === 'final_grade';

                                                                const p1 = parseFloat(student.partial_1);
                                                                const p2 = parseFloat(student.partial_2);
                                                                const p3 = parseFloat(student.partial_3);
                                                                const arePartialsComplete = !isNaN(p1) && !isNaN(p2) && !isNaN(p3);

                                                                return (
                                                                    <TableCell key={`${student.student_id}-${periodKey}`} className="p-1">
                                                                        <Input
                                                                            type="number"
                                                                            step="0.1"
                                                                            min="0"
                                                                            max="10"
                                                                            readOnly={isFinalGradeColumn && arePartialsComplete}
                                                                            value={student[dbKey] ?? ''}
                                                                            onChange={(e) => handleGradeChange(student.student_id, dbKey, e.target.value)}
                                                                            className={`w-20 text-center font-medium ${
                                                                                isFinalGradeColumn && arePartialsComplete ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                                                            } ${
                                                                                student[dbKey] === null || student[dbKey] === '' || isNaN(parseFloat(student[dbKey]))
                                                                                    ? 'bg-white'
                                                                                    : student[dbKey] >= 6
                                                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                                                    : 'bg-red-100 text-red-800 border-red-200'
                                                                            }`}
                                                                        />
                                                                    </TableCell>
                                                                )
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex justify-end mt-4 gap-2">
                                            <Button onClick={handleGeneratePDF} variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                                <FileText className="h-4 w-4 mr-2" /> Generar PDF
                                            </Button>
                                            <Button onClick={handleSaveChanges} disabled={isSavingGrades} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                {isSavingGrades 
                                                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                                                    : <><Save className="h-4 w-4 mr-2" /> Guardar Calificaciones</>
                                                }
                                            </Button>
                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-center py-4 text-slate-500">Cargando alumnos...</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="incidents" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                                    Historial de Incidencias
                                </CardTitle>
                                <CardDescription>Consulta el estado de las incidencias que has reportado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Alumno</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportedIncidents.map((incident) => (
                                            <TableRow key={incident.id}>
                                                <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="font-medium">{incident.student_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{incident.type}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate" title={incident.description}>{incident.description || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        incident.status === 'Justificada' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        incident.status === 'Rechazada' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        'bg-amber-100 text-amber-800 border-amber-200'
                                                    }>
                                                        {incident.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {reportedIncidents.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                    No has reportado incidencias.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profile" className="mt-6">
                        <TutorInformation />
                    </TabsContent>
                </Tabs>
            </div>

            <SuccessModal 
                open={showSuccessDialog} 
                onOpenChange={setShowSuccessDialog} 
                description={successMessage} 
            />

            <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reportar Incidencia</DialogTitle>
                        <DialogDescription>
                            Reportando a: <span className="font-bold">{incidentData.studentName}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="incident-type">Tipo de Incidencia</Label>
                                <ReactSelect
                                    instanceId="incident-type-select"
                                    options={incidentTypes}
                                    value={incidentForm.type}
                                    onChange={(option) => setIncidentForm(prev => ({ ...prev, type: option }))}
                                    placeholder="Seleccionar tipo..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="incident-date">Fecha</Label>
                                <Input
                                    id="incident-date"
                                    type="date"
                                    value={incidentForm.date}
                                    onChange={(e) => setIncidentForm(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incident-description">Descripción (Opcional)</Label>
                            <Textarea
                                id="incident-description"
                                placeholder="Añade comentarios sobre la falta, retardo o conducta..."
                                value={incidentForm.description}
                                onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsIncidentDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveIncident} disabled={isSavingIncident} className="bg-blue-600 hover:bg-blue-700">
                            {isSavingIncident 
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                                : "Guardar Incidencia"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
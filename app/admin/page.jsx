"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Bell,
    Users,
    AlertOctagon,
    Activity,
    Home,
    Inbox,
    Upload,
    Settings,
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    MoreVertical,
    FileText,
    AlertCircle,
    TrendingUp,
    Calendar,
    CalendarClock,
    Edit,
    Trash2,
    Plus,
} from "lucide-react"

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState("dashboard")
    const [selectedJustification, setSelectedJustification] = useState(null)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [uploadStep, setUploadStep] = useState(1)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [userFilter, setUserFilter] = useState("all")
    const [selectedLevel, setSelectedLevel] = useState("primaria")
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState(null)
    // </CHANGE>

    // Mock data
    const kpiData = {
        pendingRequests: 12,
        activeStudents: { current: 847, capacity: 900 },
        groupsWithoutTeacher: 3,
        recentActivities: 18,
    }

    const recentActivities = [
        { id: 1, user: "María López", action: "Subió CSV de nuevos alumnos", time: "Hace 5 min" },
        { id: 2, user: "Sistema", action: "Justificación aprobada - Juan Pérez", time: "Hace 12 min" },
        { id: 3, user: "Carlos Admin", action: "Actualizó grupo 6-A", time: "Hace 23 min" },
        { id: 4, user: "Ana García", action: "Nuevo tutor registrado", time: "Hace 1 hora" },
        { id: 5, user: "Sistema", action: "Backup automático completado", time: "Hace 2 horas" },
    ]

    const justifications = [
        {
            id: 1,
            studentName: "Juan Pérez Gómez",
            group: "5-B",
            date: "2024-01-15",
            type: "Falta",
            status: "pending",
            attendanceRate: 92,
            reason: "Cita médica",
            evidence: "/medical-certificate.png",
        },
        {
            id: 2,
            studentName: "María González",
            group: "3-A",
            date: "2024-01-14",
            type: "Retardo",
            status: "pending",
            attendanceRate: 88,
            reason: "Tráfico vehicular",
            evidence: "/traffic-photo.jpg",
        },
        {
            id: 3,
            studentName: "Carlos López",
            group: "6-C",
            date: "2024-01-13",
            type: "Falta",
            status: "pending",
            attendanceRate: 95,
            reason: "Asunto familiar",
            evidence: "/family-document.jpg",
        },
    ]

    const users = [
        {
            id: 1,
            name: "Juan Pérez Gómez",
            role: "Alumno",
            grade: "5-B",
            email: "juan.perez@escuela.edu",
            status: "Activo",
        },
        {
            id: 2,
            name: "María González",
            role: "Alumno",
            grade: "3-A",
            email: "maria.gonzalez@escuela.edu",
            status: "Activo",
        },
        { id: 3, name: "Ana Martínez", role: "Tutor", grade: "-", email: "ana.martinez@email.com", status: "Activo" },
        {
            id: 4,
            name: "Prof. Roberto Silva",
            role: "Docente",
            grade: "5-B",
            email: "roberto.silva@escuela.edu",
            status: "Activo",
        },
        {
            id: 5,
            name: "Carlos López",
            role: "Alumno",
            grade: "6-C",
            email: "carlos.lopez@escuela.edu",
            status: "Inactivo",
        },
    ]

    const csvData = [
        { row: 1, student: "Juan", tutor: "Mario", relation: "Padre", email: "mario@email.com", status: "valid" },
        { row: 2, student: "Ana", tutor: "Laura", relation: "Madre", email: "laura@email.com", status: "valid" },
        { row: 3, student: "Pedro", tutor: "José", relation: "Tutor", email: "invalid-email", status: "error" },
        { row: 4, student: "Sofía", tutor: "Carmen", relation: "Madre", email: "carmen@email.com", status: "valid" },
    ]

    const academicLevels = {
        kinder: {
            name: "Kinder",
            groups: [
                {
                    id: "k1",
                    name: "Kinder 1-A",
                    students: 18,
                    teacher: "Prof. Ana García",
                    teacherEmail: "ana.garcia@escuela.edu",
                    schedule: [
                        { day: "Lunes", time: "8:00-9:00", subject: "Matemáticas", teacher: "Prof. Ana García" },
                        { day: "Lunes", time: "9:00-10:00", subject: "Español", teacher: "Prof. Ana García" },
                        { day: "Martes", time: "8:00-9:00", subject: "Ciencias", teacher: "Prof. Ana García" },
                    ],
                },
                {
                    id: "k2",
                    name: "Kinder 2-A",
                    students: 20,
                    teacher: "Prof. Laura Martínez",
                    teacherEmail: "laura.martinez@escuela.edu",
                    schedule: [],
                },
            ],
        },
        primaria: {
            name: "Primaria",
            groups: [
                {
                    id: "p1",
                    name: "1-A",
                    students: 25,
                    teacher: "Prof. Carlos Ruiz",
                    teacherEmail: "carlos.ruiz@escuela.edu",
                    schedule: [
                        { day: "Lunes", time: "8:00-9:00", subject: "Matemáticas", teacher: "Prof. Carlos Ruiz" },
                        { day: "Lunes", time: "9:00-10:00", subject: "Español", teacher: "Prof. Carlos Ruiz" },
                        { day: "Lunes", time: "10:00-11:00", subject: "Ciencias", teacher: "Prof. María López" },
                    ],
                },
                {
                    id: "p2",
                    name: "2-B",
                    students: 23,
                    teacher: "Prof. Roberto Silva",
                    teacherEmail: "roberto.silva@escuela.edu",
                    schedule: [],
                },
                {
                    id: "p3",
                    name: "5-B",
                    students: 28,
                    teacher: "Prof. Roberto Silva",
                    teacherEmail: "roberto.silva@escuela.edu",
                    schedule: [
                        { day: "Lunes", time: "8:00-9:00", subject: "Matemáticas", teacher: "Prof. Roberto Silva" },
                        { day: "Lunes", time: "9:00-10:00", subject: "Historia", teacher: "Prof. Ana Morales" },
                    ],
                },
            ],
        },
        secundaria: {
            name: "Secundaria",
            groups: [
                {
                    id: "s1",
                    name: "7-A",
                    students: 30,
                    teacher: "Prof. Diana Torres",
                    teacherEmail: "diana.torres@escuela.edu",
                    schedule: [
                        { day: "Lunes", time: "7:00-8:00", subject: "Matemáticas", teacher: "Prof. Diana Torres" },
                        { day: "Lunes", time: "8:00-9:00", subject: "Física", teacher: "Prof. Jorge Ramírez" },
                        { day: "Lunes", time: "9:00-10:00", subject: "Química", teacher: "Prof. Sandra Pérez" },
                    ],
                },
                {
                    id: "s2",
                    name: "8-B",
                    students: 27,
                    teacher: "Prof. Miguel Ángel",
                    teacherEmail: "miguel.angel@escuela.edu",
                    schedule: [],
                },
            ],
        },
    }

    const teachers = [
        "Prof. Ana García",
        "Prof. Laura Martínez",
        "Prof. Carlos Ruiz",
        "Prof. Roberto Silva",
        "Prof. María López",
        "Prof. Diana Torres",
        "Prof. Jorge Ramírez",
        "Prof. Sandra Pérez",
        "Prof. Ana Morales",
        "Prof. Miguel Ángel",
    ]

    const subjects = [
        "Matemáticas",
        "Español",
        "Ciencias",
        "Historia",
        "Geografía",
        "Inglés",
        "Educación Física",
        "Artes",
        "Física",
        "Química",
        "Biología",
    ]

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
    // </CHANGE>

    const handleApprove = (justification) => {
        console.log("[v0] Approving justification:", justification.id)
        setSelectedJustification(null)
    }

    const handleReject = () => {
        console.log("[v0] Rejecting justification with reason:", rejectReason)
        setRejectDialogOpen(false)
        setRejectReason("")
        setSelectedJustification(null)
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            console.log("[v0] File uploaded:", file.name)
            setUploadProgress(0)
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        setUploadStep(2)
                        return 100
                    }
                    return prev + 10
                })
            }, 200)
        }
    }

    const handleEditSchedule = (scheduleItem) => {
        setEditingSchedule(scheduleItem)
        setScheduleDialogOpen(true)
    }

    const handleAddSchedule = () => {
        setEditingSchedule({ day: "Lunes", time: "8:00-9:00", subject: "", teacher: "" })
        setScheduleDialogOpen(true)
    }

    const handleSaveSchedule = () => {
        console.log("[v0] Saving schedule:", editingSchedule)
        setScheduleDialogOpen(false)
        setEditingSchedule(null)
    }

    const handleDeleteSchedule = (scheduleItem) => {
        console.log("[v0] Deleting schedule:", scheduleItem)
    }
    // </CHANGE>

    return (
        <div className="flex h-full bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold">Control Escolar</h1>
                    <p className="text-sm text-slate-400">Sistema de Gestión</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveView("dashboard")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                            }`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Panel de Control</span>
                    </button>

                    <button
                        onClick={() => setActiveView("justifications")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === "justifications" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                            }`}
                    >
                        <Inbox className="h-5 w-5" />
                        <span>Bandeja de Solicitudes</span>
                        {kpiData.pendingRequests > 0 && (
                            <Badge className="ml-auto bg-red-600 text-white">{kpiData.pendingRequests}</Badge>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveView("schedules")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === "schedules" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                            }`}
                    >
                        <CalendarClock className="h-5 w-5" />
                        <span>Horarios</span>
                    </button>
                    {/* </CHANGE> */}

                    <button
                        onClick={() => setActiveView("users")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === "users" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                            }`}
                    >
                        <Users className="h-5 w-5" />
                        <span>Directorio de Usuarios</span>
                    </button>

                    <button
                        onClick={() => setActiveView("upload")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === "upload" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                            }`}
                    >
                        <Upload className="h-5 w-5" />
                        <span>Carga Masiva</span>
                    </button>

            
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium">AD</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Admin</p>
                            <p className="text-xs text-slate-400">Administrador</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between p-10">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Home className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-slate-900 font-medium">
                            {activeView === "dashboard" && "Panel de Control"}
                            {activeView === "justifications" && "Bandeja de Solicitudes"}
                            {activeView === "schedules" && "Gestión de Horarios"}
                            {activeView === "users" && "Directorio de Usuarios"}
                            {activeView === "upload" && "Carga Masiva CSV"}
                            {activeView === "settings" && "Configuración"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar usuarios o grupos..."
                                className="pl-10 w-64 border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">AD</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 " >
                    {/* View A: Dashboard */}
                    {activeView === "dashboard" && (
                        <div className="space-y-6">
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="border-slate-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-slate-600">Solicitudes Pendientes</CardTitle>
                                            <Bell className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-3xl font-bold text-slate-900">{kpiData.pendingRequests}</div>
                                            {kpiData.pendingRequests > 10 && <Badge className="bg-red-600 text-white">Alta</Badge>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-slate-600">Alumnos Activos</CardTitle>
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">{kpiData.activeStudents.current}</div>
                                        <p className="text-sm text-slate-500 mt-1">de {kpiData.activeStudents.capacity} capacidad</p>
                                        <Progress
                                            value={(kpiData.activeStudents.current / kpiData.activeStudents.capacity) * 100}
                                            className="mt-2 h-2"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-slate-600">Grupos Sin Docente</CardTitle>
                                            <AlertOctagon className="h-4 w-4 text-red-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-3xl font-bold text-red-600">{kpiData.groupsWithoutTeacher}</div>
                                            <Badge className="bg-red-100 text-red-700 border-red-200">Crítico</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-medium text-slate-600">Actividades Recientes</CardTitle>
                                            <Activity className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">{kpiData.recentActivities}</div>
                                        <p className="text-sm text-slate-500 mt-1">últimas 24 horas</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Activity Table */}
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Actividad Reciente del Sistema</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Acción</TableHead>
                                                <TableHead className="text-right">Tiempo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentActivities.map((activity) => (
                                                <TableRow key={activity.id}>
                                                    <TableCell className="font-medium">{activity.user}</TableCell>
                                                    <TableCell>{activity.action}</TableCell>
                                                    <TableCell className="text-right text-slate-500">{activity.time}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* View B: Justifications Review */}
                    {activeView === "justifications" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                            {/* Left Panel - List */}
                            <Card className="lg:col-span-1 border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Justificaciones Pendientes</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-200">
                                        {justifications.map((justification) => (
                                            <button
                                                key={justification.id}
                                                onClick={() => setSelectedJustification(justification)}
                                                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedJustification?.id === justification.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                                                    }`}
                                            >
                                                <div className="font-medium text-slate-900">{justification.studentName}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-slate-500">{justification.group}</span>
                                                    <Badge
                                                        className={
                                                            justification.type === "Falta"
                                                                ? "bg-red-100 text-red-700 border-red-200"
                                                                : "bg-amber-100 text-amber-700 border-amber-200"
                                                        }
                                                    >
                                                        {justification.type}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {justification.date}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Panel - Detail */}
                            <Card className="lg:col-span-2 border-slate-200">
                                {selectedJustification ? (
                                    <>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    Justificante de {selectedJustification.type} - {selectedJustification.studentName}
                                                </CardTitle>
                                                <Badge
                                                    className={
                                                        selectedJustification.type === "Falta"
                                                            ? "bg-red-100 text-red-700 border-red-200"
                                                            : "bg-amber-100 text-amber-700 border-amber-200"
                                                    }
                                                >
                                                    {selectedJustification.type}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Student Info */}
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm text-slate-500">Alumno</p>
                                                    <p className="font-medium text-slate-900">{selectedJustification.studentName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Grupo</p>
                                                    <p className="font-medium text-slate-900">{selectedJustification.group}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Fecha</p>
                                                    <p className="font-medium text-slate-900">{selectedJustification.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Tasa de Asistencia</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900">{selectedJustification.attendanceRate}%</p>
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Motivo</Label>
                                                <p className="mt-1 text-slate-900">{selectedJustification.reason}</p>
                                            </div>

                                            {/* Evidence */}
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Evidencia Adjunta</Label>
                                                <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-4">
                                                    <img
                                                        src={selectedJustification.evidence || "/placeholder.svg"}
                                                        alt="Evidencia"
                                                        className="w-full h-48 object-cover rounded"
                                                    />
                                                </div>
                                            </div>

                                            {/* Context Stats */}
                                            <Card className="bg-blue-50 border-blue-200">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-blue-900">Contexto del Estudiante</p>
                                                            <p className="text-sm text-blue-700 mt-1">
                                                                Este alumno tiene una tasa de asistencia del {selectedJustification.attendanceRate}%, lo
                                                                cual está{" "}
                                                                {selectedJustification.attendanceRate >= 90
                                                                    ? "por encima del promedio institucional"
                                                                    : "por debajo del promedio institucional"}
                                                                .
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </CardContent>

                                        {/* Action Bar */}
                                        <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-end gap-3">
                                            <Button
                                                variant="destructive"
                                                onClick={() => setRejectDialogOpen(true)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Rechazar
                                            </Button>
                                            <Button
                                                onClick={() => handleApprove(selectedJustification)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Aprobar y Justificar
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <div className="text-center">
                                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>Selecciona una justificación para ver los detalles</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* View C: CSV Upload Wizard */}
                    {activeView === "upload" && (
                        <Card className="max-w-4xl mx-auto border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Asistente de Importación Masiva</CardTitle>
                                <div className="flex items-center gap-2 mt-4">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                                            }`}
                                    >
                                        1
                                    </div>
                                    <div className={`flex-1 h-1 ${uploadStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                                            }`}
                                    >
                                        2
                                    </div>
                                    <div className={`flex-1 h-1 ${uploadStep >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                                            }`}
                                    >
                                        3
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Step 1: Upload */}
                                {uploadStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                                            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                            <p className="text-lg font-medium text-slate-700 mb-2">
                                                Sube tu archivo CSV con datos de Alumnos y Tutores
                                            </p>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                                            </p>
                                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs mx-auto" />
                                        </div>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600">Subiendo archivo...</span>
                                                    <span className="text-slate-900 font-medium">{uploadProgress}%</span>
                                                </div>
                                                <Progress value={uploadProgress} className="h-2" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Review */}
                                {uploadStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-blue-900">Datos Detectados</p>
                                                    <p className="text-sm text-blue-700">Se encontraron 150 estudiantes, 140 tutores</p>
                                                </div>
                                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>

                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Fila</TableHead>
                                                        <TableHead>Alumno</TableHead>
                                                        <TableHead>Tutor</TableHead>
                                                        <TableHead>Relación</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {csvData.map((row) => (
                                                        <TableRow key={row.row} className={row.status === "error" ? "bg-red-50" : ""}>
                                                            <TableCell>{row.row}</TableCell>
                                                            <TableCell className="font-medium">{row.student}</TableCell>
                                                            <TableCell>{row.tutor}</TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-slate-600">
                                                                    {row.student} ↔ {row.tutor}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>{row.email}</TableCell>
                                                            <TableCell>
                                                                {row.status === "valid" ? (
                                                                    <Badge className="bg-green-100 text-green-700 border-green-200">Válido</Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                                                        Formato de email no válido
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <Button variant="outline" onClick={() => setUploadStep(1)}>
                                                Volver
                                            </Button>
                                            <Button onClick={() => setUploadStep(3)} className="bg-blue-600 hover:bg-blue-700">
                                                Continuar a Importación
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Finish */}
                                {uploadStep === 3 && (
                                    <div className="space-y-4 text-center py-8">
                                        <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                                        <h3 className="text-xl font-bold text-slate-900">Importación Completada</h3>
                                        <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
                                            <div className="space-y-2 text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Estudiantes creados:</span>
                                                    <span className="font-medium text-slate-900">147</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Tutores creados:</span>
                                                    <span className="font-medium text-slate-900">140</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Relaciones establecidas:</span>
                                                    <span className="font-medium text-slate-900">147</span>
                                                </div>
                                                <div className="flex justify-between text-red-600">
                                                    <span>Errores:</span>
                                                    <span className="font-medium">3</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setUploadStep(1)
                                                setUploadProgress(0)
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Nueva Importación
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* View D: User Directory */}
                    {activeView === "users" && (
                        <Card className="border-slate-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Directorio de Usuarios</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select value={userFilter} onValueChange={setUserFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="student">Alumnos</SelectItem>
                                                <SelectItem value="tutor">Tutores</SelectItem>
                                                <SelectItem value="teacher">Docentes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Grado/Grupo</TableHead>
                                            <TableHead>Correo Electrónico</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            user.role === "Alumno"
                                                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                                                : user.role === "Docente"
                                                                    ? "bg-purple-100 text-purple-700 border-purple-200"
                                                                    : "bg-green-100 text-green-700 border-green-200"
                                                        }
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.grade}</TableCell>
                                                <TableCell className="text-slate-600">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            user.status === "Activo"
                                                                ? "bg-green-100 text-green-700 border-green-200"
                                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                                        }
                                                    >
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Editar perfil</DropdownMenuItem>
                                                            <DropdownMenuItem>Restablecer contraseña</DropdownMenuItem>
                                                            <DropdownMenuItem>Ver relaciones</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {activeView === "schedules" && (
                        <div className="space-y-6">
                            {/* Level Selection */}
                            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                                <CardHeader>
                                    <CardTitle className="text-lg text-blue-900">Gestión de Horarios por Nivel Académico</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setSelectedLevel("kinder")}
                                            className={
                                                selectedLevel === "kinder"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                                            }
                                        >
                                            Kinder
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedLevel("primaria")}
                                            className={
                                                selectedLevel === "primaria"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                                            }
                                        >
                                            Primaria
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedLevel("secundaria")}
                                            className={
                                                selectedLevel === "secundaria"
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                                            }
                                        >
                                            Secundaria
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Groups Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Groups List */}
                                <Card className="lg:col-span-1 border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Grupos de {academicLevels[selectedLevel].name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-200">
                                            {academicLevels[selectedLevel].groups.map((group) => (
                                                <button
                                                    key={group.id}
                                                    onClick={() => setSelectedGroup(group)}
                                                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedGroup?.id === group.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-slate-900">{group.name}</div>
                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                            {group.students} alumnos
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-slate-600 mt-2">{group.teacher}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{group.teacherEmail}</div>
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <CalendarClock className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-500">{group.schedule.length} clases programadas</span>
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
                                                            {selectedGroup.students} alumnos • {selectedGroup.teacher}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddSchedule}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Clase
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedGroup.schedule.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {/* Schedule by Day */}
                                                        {days.map((day) => {
                                                            const daySchedule = selectedGroup.schedule.filter((item) => item.day === day)
                                                            if (daySchedule.length === 0) return null

                                                            return (
                                                                <div key={day} className="border border-slate-200 rounded-lg overflow-hidden">
                                                                    <div className="bg-blue-600 text-white px-4 py-2 font-medium">{day}</div>
                                                                    <div className="divide-y divide-slate-200">
                                                                        {daySchedule.map((schedule, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="p-4 hover:bg-slate-50 flex items-center justify-between"
                                                                            >
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                                                                                            {schedule.time}
                                                                                        </Badge>
                                                                                        <span className="font-medium text-slate-900">{schedule.subject}</span>
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
                                                                    Total: {selectedGroup.schedule.length} clases programadas esta semana
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
                        </div>
                    )}
                    {/* </CHANGE> */}
                </main>
            </div>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Justificación</DialogTitle>
                        <DialogDescription>
                            Por favor, proporciona un motivo para el rechazo de esta justificación.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Motivo del Rechazo</Label>
                            <Textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explica por qué se rechaza esta justificación..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                            Confirmar Rechazo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule?.subject ? "Editar Clase" : "Agregar Nueva Clase"}</DialogTitle>
                        <DialogDescription>
                            Configura los detalles de la clase para el grupo {selectedGroup?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Día de la Semana</Label>
                            <Select
                                value={editingSchedule?.day}
                                onValueChange={(value) => setEditingSchedule({ ...editingSchedule, day: value })}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Selecciona el día" />
                                </SelectTrigger>
                                <SelectContent>
                                    {days.map((day) => (
                                        <SelectItem key={day} value={day}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Horario</Label>
                            <Select
                                value={editingSchedule?.time}
                                onValueChange={(value) => setEditingSchedule({ ...editingSchedule, time: value })}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Selecciona el horario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((slot) => (
                                        <SelectItem key={slot} value={slot}>
                                            {slot}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Materia</Label>
                            <Select
                                value={editingSchedule?.subject}
                                onValueChange={(value) => setEditingSchedule({ ...editingSchedule, subject: value })}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Selecciona la materia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject} value={subject}>
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Profesor</Label>
                            <Select
                                value={editingSchedule?.teacher}
                                onValueChange={(value) => setEditingSchedule({ ...editingSchedule, teacher: value })}
                            >
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Selecciona el profesor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher} value={teacher}>
                                            {teacher}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
            {/* </CHANGE> */}
        </div>
    )
}

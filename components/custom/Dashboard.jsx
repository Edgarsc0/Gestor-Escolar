"use client"

import CertificateDownloadButton from "./CertificateDownloadButton"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card" // IMPORTADO
import DashboardHeader from "./DashboardHeader"
import DashboardKPIs from "./DashboardKPIs"
import AcademicTab from "./AcademicTab"
import ScheduleTab from "./ScheduleTab"
import IncidentsTab from "./IncidentsTab"
import ProfileTab from "./ProfileTab"
import JustificationDialog from "./JustificationDialog"
import { LoadingOverlay } from "./LoadingOverlay"
import KardexTab from "./KardexTab"
import AttendanceTab from "./AttendanceTab"
import { AlertCircle, Lock, FileDown } from "lucide-react"

const RestrictedAccessMessage = () => (
  <div className="mt-6 flex justify-center">
    <Card className="w-full max-w-3xl border-orange-200 bg-orange-50/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-orange-100">
          <Lock className="w-12 h-12 text-orange-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-bold text-gray-900">Acceso Limitado</h3>
          <p className="text-gray-500">
            Debido a las regulaciones de privacidad para alumnos de Educación Media Superior y Superior, esta información es confidencial.
          </p>
          <p className="text-sm text-orange-600 font-medium bg-orange-100/50 py-1 px-3 rounded-full inline-block">
            Solo el alumno tiene acceso a esta sección
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTab = searchParams.get('view') || 'academic'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [justificationDialogOpen, setJustificationDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)
  const [currentPeriod, setCurrentPeriod] = useState("")
  const [scheduleData, setScheduleData] = useState([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)
  const [currentChild, setCurrentChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [incidents, setIncidents] = useState([])
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true)
  const [refreshIncidents, setRefreshIncidents] = useState(0)
  const [kardexData, setKardexData] = useState([])
  const [isLoadingKardex, setIsLoadingKardex] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({ percentage: null, present: 0, absent: 0, delay: 0, justified: 0, total: 0 })
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

  const studentId = user?.role === 'student' ? user.id : params?.son;

  const showKardex = user?.role === 'tutor' || user?.role === 'student'

  const isRestricted = user?.role === 'tutor' && ["preparatoria", "universidad"].includes(currentChild?.level_slug?.toLowerCase() || "");

  useEffect(() => {
    const view = searchParams.get('view');
    if (view && view !== activeTab) {
        setActiveTab(view);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const cycle = month >= 8 ? `${year} - ${year + 1}` : `${year - 1} - ${year}`
    setCurrentPeriod(`Ciclo Escolar ${cycle}`)
  }, [])

  useEffect(() => {
    const fetchChildren = async () => {
        if (!user?.id || user.role !== 'tutor') {
            setIsLoadingChildren(false);
            return;
        }
        setIsLoadingChildren(true);
        try {
            const res = await fetch(`/api/user_relationships/tutor/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setChildren(data);
                
                if (params?.son) {
                    const current = data.find(c => String(c.student_id) === String(params.son));
                    if (current) setCurrentChild(current);
                }
            }
        } catch (error) {
            console.error("Error fetching children:", error);
        } finally {
            setIsLoadingChildren(false);
        }
    }
    fetchChildren();
  }, [user, params]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
        if (user?.role === 'student') {
            setIsLoadingChildren(true);
            try {
                // Intentar obtener información del grupo para saber el nivel
                const groupRes = await fetch(`/api/groups/student/${user.id}`);
                let groupInfo = {};
                if (groupRes.ok) {
                    const groups = await groupRes.json();
                    if (groups.length > 0) groupInfo = groups[0];
                }
                
                setCurrentChild({
                    student_id: user.id,
                    student_name: user.full_name,
                    group_name: groupInfo.name,
                    level_name: groupInfo.level_name,
                    level_slug: groupInfo.level_slug
                });
            } catch (e) { console.error(e); } 
            finally { setIsLoadingChildren(false); }
        }
    }
    fetchStudentDetails();
  }, [user]);

  useEffect(() => {
    const fetchGrades = async () => {
        if (!studentId || isRestricted) {
            setIsLoadingGrades(false); 
            return;
        } 

        setIsLoadingGrades(true)
        try {
            const res = await fetch(`/api/grades/student/${studentId}`)
            if (res.ok) {
                const data = await res.json()
                const formattedSubjects = data.map(item => ({
                    name: item.subject_name,
                    group: item.group_name,
                    p1: item.partial_1,
                    p2: item.partial_2,
                    p3: item.partial_3,
                    final: item.final_grade,
                    color: "emerald"
                }))
                setSubjects(formattedSubjects)
            } 
        } catch (error) {
            console.error("Error fetching grades:", error)
        } finally {
            setIsLoadingGrades(false)
        }
    }

    fetchGrades()
  }, [studentId, isRestricted]) // isRestricted dependency is important

  useEffect(() => {
    const fetchSchedule = async () => {
        if (!studentId || isRestricted) {
            setIsLoadingSchedule(false);
            return;
        }
        setIsLoadingSchedule(true)
        try {
            const res = await fetch(`/api/schedules/student/${studentId}`)
            if (res.ok) {
                setScheduleData(await res.json())
            }
        } catch (error) {
            console.error("Error fetching schedule:", error)
        } finally {
            setIsLoadingSchedule(false)
        }
    }
    fetchSchedule()
  }, [studentId, isRestricted]) // isRestricted dependency is important

  useEffect(() => {
    const fetchIncidents = async () => {
        if (!studentId || isRestricted) {
            setIsLoadingIncidents(false);
            return;
        }
        setIsLoadingIncidents(true)
        try {
            const res = await fetch(`/api/incidents?student_id=${studentId}`)
            if (res.ok) {
                const data = await res.json()
                const formatted = data.map(i => ({
                    id: i.id,
                    date: new Date(i.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
                    type: i.type,
                    subject: i.description || "Sin descripción",
                    status: i.status === 'Pendiente por justificar' ? 'Pendiente' : i.status,
                }))
                setIncidents(formatted)
            }
        } catch (error) {
            console.error("Error fetching incidents:", error)
        } finally {
            setIsLoadingIncidents(false)
        }
    }
    fetchIncidents()
  }, [studentId, refreshIncidents, isRestricted]) // isRestricted dependency is important

  useEffect(() => {
    const fetchKardex = async () => {
        if (!studentId || isRestricted) return;
        setIsLoadingKardex(true)
        try {
            const res = await fetch(`/api/grades/kardex/${studentId}`)
            if (res.ok) {
                const kardex = await res.json();
                setKardexData(kardex)
            }
        } catch (error) {
            console.error("Error fetching kardex:", error)
        } finally {
            setIsLoadingKardex(false)
        }
    }
    fetchKardex()
  }, [studentId, isRestricted]) // isRestricted dependency is important

  useEffect(() => {
    const fetchAttendance = async () => {
        if (!studentId) return
        setIsLoadingAttendance(true)
        try {
            const res = await fetch(`/api/attendance?student_id=${studentId}`)
            if (res.ok) {
                const data = await res.json()
                setAttendanceData(data)
                
                const total = data.length
                if (total > 0) {
                    const present = data.filter(a => a.status === 'presente').length
                    const absent = data.filter(a => a.status === 'falta').length
                    const delay = data.filter(a => a.status === 'retardo').length
                    const justified = data.filter(a => a.status === 'justificado').length
                    
                    // Calculation: (Total - Absent) / Total * 100
                    const effectiveAttendance = total - absent
                    const percentage = ((effectiveAttendance / total) * 100).toFixed(1)
                    
                    setAttendanceStats({ percentage, present, absent, delay, justified, total })
                } else {
                     setAttendanceStats({ percentage: null, present: 0, absent: 0, delay: 0, justified: 0, total: 0 })
                }
            }
        } catch (error) {
            console.error("Error fetching attendance:", error)
        } finally {
            setIsLoadingAttendance(false)
        }
    }
    fetchAttendance()
  }, [studentId])

  const handleJustify = (incident) => {
    setSelectedIncident(incident)
    setJustificationDialogOpen(true)
  }

  const handleAcknowledge = async (incident) => {
    setIsLoadingIncidents(true)
    try {
        const res = await fetch(`/api/incidents/${incident.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Justificada' })
        })
        
        if (res.ok) {
            setRefreshIncidents(prev => prev + 1)
        }
    } catch (error) {
        console.error("Error acknowledging incident:", error)
        setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudo actualizar el estado de la incidencia." })
    } finally {
        setIsLoadingIncidents(false)
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (user?.role === 'student') {
      router.push(`/student?view=${value}`, { scroll: false });
    } else {
      router.push(`/padre_tutor/${studentId}?view=${value}`, { scroll: false });
    }
  };

  const handleDownloadAttendance = async () => {
    if (!studentId) return;
    try {
        const res = await fetch(`/api/attendance?student_id=${studentId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.length === 0) {
                setErrorDialog({ isOpen: true, title: "Sin datos", description: "No hay registros de asistencia para descargar." });
                return;
            }
            
            // Generar CSV
            const headers = ["Fecha", "Materia", "Profesor", "Estado"];
            const rows = data.map(item => [
                new Date(item.date).toLocaleDateString('es-MX'),
                item.subject_name || "Desconocida",
                item.teacher_name || "Sin asignar",
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
            link.setAttribute("download", `Reporte_Asistencia_${currentChild?.student_name || 'Alumno'}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Error downloading attendance:", error);
        setErrorDialog({ isOpen: true, title: "Error", description: "No se pudo descargar el reporte." });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-10">
      {(isLoadingChildren || isLoadingGrades || isLoadingSchedule || isLoadingIncidents || isLoadingKardex || isLoadingAttendance) && <LoadingOverlay message="Cargando información del alumno..." />}
      
      {/* Header Section */}
      <DashboardHeader
        currentChild={currentChild}
        childrenList={children}
        isLoading={isLoadingChildren}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
             <Button variant="outline" onClick={handleDownloadAttendance} className="gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
                <FileDown className="h-4 w-4" />
                Descargar Reporte de Asistencia
             </Button>
        </div>

        {!isRestricted && (
           <DashboardKPIs subjects={subjects} scheduleData={scheduleData} incidents={incidents} />
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className={`grid w-full ${showKardex ? "grid-cols-6" : "grid-cols-5"}`} >
            <TabsTrigger value="academic">Académico</TabsTrigger>
            <TabsTrigger value="schedule">Horario</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="incidents">Incidencias</TabsTrigger>
            {showKardex && <TabsTrigger value="kardex">Kardex</TabsTrigger>}
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="academic">
            {isRestricted ? (
                <RestrictedAccessMessage />
            ) : (
                <AcademicTab subjects={subjects} period={currentPeriod} />
            )}
          </TabsContent>

          <TabsContent value="schedule">
            {isRestricted ? (
                <RestrictedAccessMessage />
            ) : (
                <ScheduleTab classes={scheduleData} isLoading={isLoadingSchedule} />
            )}
          </TabsContent>

          <TabsContent value="attendance">
            {isRestricted ? (
                <RestrictedAccessMessage />
            ) : (
                <AttendanceTab attendanceData={attendanceData} stats={attendanceStats} />
            )}
          </TabsContent>

          <TabsContent value="incidents">
            {isRestricted ? (
                <RestrictedAccessMessage />
            ) : (
                <IncidentsTab incidents={incidents} onJustify={handleJustify} onAcknowledge={handleAcknowledge} />
            )}
          </TabsContent>

          {showKardex && (
            <TabsContent value="kardex">
              {isRestricted ? (
                  <RestrictedAccessMessage />
              ) : (
                  <KardexTab kardexData={kardexData} />
              )}
            </TabsContent>
          )}

          <TabsContent value="profile">
            {(currentChild || user?.role === 'student') && (
                <div className="flex justify-end pb-2">
                    <CertificateDownloadButton 
                        studentId={currentChild?.student_id || params?.son || user?.id}
                        studentName={currentChild?.student_name || user?.full_name}
                        // Pasamos el nivel (slug o name) que ya tienes en currentChild
                        studentLevel={currentChild?.level_slug || currentChild?.level_name || "primaria"}
                        // Aquí podrías conectar una variable real si tienes lógica de adeudos
                        hasAdministrativeBlock={false} 
                    />
                </div>
            )}
            <ProfileTab 
                studentId={studentId} 
                studentName={currentChild?.student_name} 
                levelSlug={currentChild?.level_slug}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Justification Dialog */}
      <JustificationDialog 
        incident={selectedIncident}
        open={justificationDialogOpen} 
        onOpenChange={setJustificationDialogOpen} 
        onSuccess={() => setRefreshIncidents(prev => prev + 1)}
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
  )
}
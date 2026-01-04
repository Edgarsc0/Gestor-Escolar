"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "./DashboardHeader"
import DashboardKPIs from "./DashboardKPIs"
import AcademicTab from "./AcademicTab"
import ScheduleTab from "./ScheduleTab"
import IncidentsTab from "./IncidentsTab"
import ProfileTab from "./ProfileTab"
import JustificationDialog from "./JustificationDialog"
import { LoadingOverlay } from "./LoadingOverlay"
import KardexTab from "./KardexTab"
import { AlertCircle } from "lucide-react"

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
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

  const studentId = params?.son;

  const showKardex = user?.role === 'tutor'

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
    const fetchGrades = async () => {
        if (!studentId) return;
        
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
  }, [studentId])

  useEffect(() => {
    const fetchSchedule = async () => {
        if (!studentId) return
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
  }, [studentId])

  useEffect(() => {
    const fetchIncidents = async () => {
        if (!studentId) return
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
  }, [studentId, refreshIncidents])

  useEffect(() => {
    const fetchKardex = async () => {
        if (!studentId) return
        setIsLoadingKardex(true)
        try {
            const res = await fetch(`/api/grades/kardex/${studentId}`)
            if (res.ok) {
                const kardex = await res.json();
                console.log("Kardex data:", kardex);
                setKardexData(kardex)
            }
        } catch (error) {
            console.error("Error fetching kardex:", error)
        } finally {
            setIsLoadingKardex(false)
        }
    }
    fetchKardex()
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
    router.push(`/padre_tutor/${studentId}?view=${value}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-slate-50 mt-10">
      {(isLoadingChildren || isLoadingGrades || isLoadingSchedule || isLoadingIncidents || isLoadingKardex) && <LoadingOverlay message="Cargando información del alumno..." />}
      
      {/* Header Section */}
      <DashboardHeader
        currentChild={currentChild}
        childrenList={children}
        isLoading={isLoadingChildren}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <DashboardKPIs subjects={subjects} scheduleData={scheduleData} incidents={incidents} />

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className={`grid w-full ${showKardex ? "grid-cols-5" : "grid-cols-4"}`} >
            <TabsTrigger value="academic">Académico</TabsTrigger>
            <TabsTrigger value="schedule">Horario</TabsTrigger>
            <TabsTrigger value="incidents">Incidencias</TabsTrigger>
            {showKardex && <TabsTrigger value="kardex">Kardex</TabsTrigger>}
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Tab A: Academic */}
          <TabsContent value="academic">
            <AcademicTab subjects={subjects} period={currentPeriod} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab classes={scheduleData} isLoading={isLoadingSchedule} />
          </TabsContent>

          {/* Tab B: Incidents */}
          <TabsContent value="incidents">
            <IncidentsTab incidents={incidents} onJustify={handleJustify} onAcknowledge={handleAcknowledge} />
          </TabsContent>

          {showKardex && (
            <TabsContent value="kardex">
              <KardexTab kardexData={kardexData} />
            </TabsContent>
          )}

          {/* Tab C: Profile */}
          <TabsContent value="profile">
            <ProfileTab studentId={params?.son || user?.id} studentName={currentChild?.student_name} />
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

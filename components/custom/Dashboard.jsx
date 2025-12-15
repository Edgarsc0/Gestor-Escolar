"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "./DashboardHeader"
import DashboardKPIs from "./DashboardKPIs"
import AcademicTab from "./AcademicTab"
import ScheduleTab from "./ScheduleTab"
import IncidentsTab from "./IncidentsTab"
import ProfileTab from "./ProfileTab"
import JustificationDialog from "./JustificationDialog"

export default function StudentDashboard() {
  const [justificationDialogOpen, setJustificationDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [studentData, setStudentData] = useState({
    bloodType: "O+",
    allergies: "Ninguna",
  })

  const subjects = [
    { name: "Matemáticas", grade: 9.5, color: "emerald" },
    { name: "Historia", grade: 8.8, color: "emerald" },
    { name: "Ciencias", grade: 9.0, color: "emerald" },
    { name: "Español", grade: 9.3, color: "emerald" },
    { name: "Educación Física", grade: 8.5, color: "emerald" },
  ]

  const incidents = [
    {
      id: 1,
      date: "12 Oct",
      type: "Falta",
      subject: "Matemáticas",
      status: "Pendiente",
    },
    {
      id: 2,
      date: "5 Oct",
      type: "Conducta",
      subject: "Historia",
      status: "Justificada",
    },
  ]

  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "María Pérez", relation: "Madre", phone: "+52 555 1234" },
    { name: "Carlos Pérez", relation: "Padre", phone: "+52 555 5678" },
  ])

  const schedule = {
    timeSlots: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 11:30",
      "11:30 - 12:30",
      "12:30 - 13:30",
      "13:30 - 14:30",
    ],
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    classes: {
      Lunes: [
        { subject: "Matemáticas", teacher: "Prof. García", room: "101" },
        { subject: "Español", teacher: "Prof. Rodríguez", room: "205" },
        { subject: "Ciencias", teacher: "Prof. Martínez", room: "302" },
        { subject: "Receso", teacher: "", room: "" },
        { subject: "Historia", teacher: "Prof. López", room: "210" },
        { subject: "Inglés", teacher: "Prof. Smith", room: "105" },
        { subject: "Arte", teacher: "Prof. Sánchez", room: "401" },
      ],
      Martes: [
        { subject: "Inglés", teacher: "Prof. Smith", room: "105" },
        { subject: "Matemáticas", teacher: "Prof. García", room: "101" },
        { subject: "Ed. Física", teacher: "Prof. Torres", room: "Gimnasio" },
        { subject: "Receso", teacher: "", room: "" },
        { subject: "Español", teacher: "Prof. Rodríguez", room: "205" },
        { subject: "Ciencias", teacher: "Prof. Martínez", room: "302" },
        { subject: "Música", teacher: "Prof. Méndez", room: "402" },
      ],
      Miércoles: [
        { subject: "Historia", teacher: "Prof. López", room: "210" },
        { subject: "Matemáticas", teacher: "Prof. García", room: "101" },
        { subject: "Español", teacher: "Prof. Rodríguez", room: "205" },
        { subject: "Receso", teacher: "", room: "" },
        { subject: "Ciencias", teacher: "Prof. Martínez", room: "302" },
        { subject: "Inglés", teacher: "Prof. Smith", room: "105" },
        { subject: "Computación", teacher: "Prof. Ramírez", room: "Lab 1" },
      ],
      Jueves: [
        { subject: "Matemáticas", teacher: "Prof. García", room: "101" },
        { subject: "Ciencias", teacher: "Prof. Martínez", room: "302" },
        { subject: "Historia", teacher: "Prof. López", room: "210" },
        { subject: "Receso", teacher: "", room: "" },
        { subject: "Ed. Física", teacher: "Prof. Torres", room: "Gimnasio" },
        { subject: "Español", teacher: "Prof. Rodríguez", room: "205" },
        { subject: "Inglés", teacher: "Prof. Smith", room: "105" },
      ],
      Viernes: [
        { subject: "Español", teacher: "Prof. Rodríguez", room: "205" },
        { subject: "Matemáticas", teacher: "Prof. García", room: "101" },
        { subject: "Arte", teacher: "Prof. Sánchez", room: "401" },
        { subject: "Receso", teacher: "", room: "" },
        { subject: "Inglés", teacher: "Prof. Smith", room: "105" },
        { subject: "Ciencias", teacher: "Prof. Martínez", room: "302" },
        { subject: "Biblioteca", teacher: "Actividad Libre", room: "Biblioteca" },
      ],
    },
  }

  const handleJustify = (incident) => {
    setSelectedIncident(incident)
    setJustificationDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-10">
      {/* Header Section */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <DashboardKPIs />

        {/* Tabs Section */}
        <Tabs defaultValue="academic" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="academic">Académico</TabsTrigger>
            <TabsTrigger value="schedule">Horario</TabsTrigger>
            <TabsTrigger value="incidents">Incidencias</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Tab A: Academic */}
          <TabsContent value="academic">
            <AcademicTab subjects={subjects} />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab schedule={schedule} />
          </TabsContent>

          {/* Tab B: Incidents */}
          <TabsContent value="incidents">
            <IncidentsTab incidents={incidents} onJustify={handleJustify} />
          </TabsContent>

          {/* Tab C: Profile */}
          <TabsContent value="profile">
            <ProfileTab                 
                studentData={studentData} 
                setStudentData={setStudentData} 
                emergencyContacts={emergencyContacts} 
                setEmergencyContacts={setEmergencyContacts}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Justification Dialog */}
      <JustificationDialog 
        open={justificationDialogOpen} 
        onOpenChange={setJustificationDialogOpen} 
      />
    </div>
  )
}

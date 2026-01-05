"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { UserProfileView } from "./UserProfileView"
import { Sidebar } from "./Sidebar"
import { AdminHeader } from "./AdminHeader"
import { DashboardView } from "./DashboardView"
import { JustificationsView } from "./JustificationsView"
import { UploadView } from "./UploadView"
import { UsersView } from "./UsersView"
import { SchedulesView } from "./SchedulesView"
import { GroupsView } from "./GroupsView"
import { TeachersView } from "./TeachersView"
import { RelationshipsView } from "./RelationshipsView"
import { SubjectsView } from "./SubjectsView"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"

function AdminDashboardContent() {
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"
    const [activeView, setActiveView] = useState(initialView)
    const [previousView, setPreviousView] = useState('dashboard')
    const [viewingUserId, setViewingUserId] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [kpiData, setKpiData] = useState({
        pendingRequests: 0,
        activeStudents: { current: 0, capacity: 0 },
        groupsWithoutTeacher: 0,
        recentActivities: 0,
    })
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

    useEffect(() => {
        const view = searchParams.get('view')
        if (view) setActiveView(view)
    }, [searchParams])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    setKpiData({
                        pendingRequests: data.pending_requests,
                        activeStudents: { current: data.active_students, capacity: data.total_capacity },
                        groupsWithoutTeacher: data.groups_without_teacher,
                        recentActivities: 0
                    })
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
                setErrorDialog({ isOpen: true, title: "Error de conexión", description: "No se pudieron cargar las estadísticas del sistema." })
            }
        }

        if (activeView === "dashboard") {
            fetchStats()
        }
    }, [activeView])

    const handleViewProfile = (userId) => {
        setPreviousView(activeView)
        setViewingUserId(userId)
        setActiveView('profile')
    }

    const handleBackFromProfile = () => {
        setViewingUserId(null)
        setActiveView(previousView)
    }

    return (
        <div className="flex h-full bg-slate-50">
            {/* Sidebar */}
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                pendingRequests={kpiData.pendingRequests}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <AdminHeader
                    activeView={activeView}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 " >
                    {activeView === 'profile' && viewingUserId ? (
                        <UserProfileView userId={viewingUserId} onBack={handleBackFromProfile} />
                    ) : (
                        <>
                            {activeView === "dashboard" && (
                                <DashboardView kpiData={kpiData} />
                            )}

                            {activeView === "justifications" && (
                                <JustificationsView />
                            )}

                            {activeView === "upload" && (
                                <UploadView />
                            )}

                            {activeView === "users" && (
                                <UsersView searchQuery={searchQuery} onViewProfile={handleViewProfile} />
                            )}

                            {activeView === "groups" && (
                                <GroupsView onViewProfile={handleViewProfile} />
                            )}

                            {activeView === "teachers" && (
                                <TeachersView onViewProfile={handleViewProfile} />
                            )}

                            {activeView === "schedules" && (
                                <SchedulesView />
                            )}

                            {activeView === "relationships" && (
                                <RelationshipsView />
                            )}

                            {activeView === "subjects" && (
                                <SubjectsView />
                            )}
                        </>
                    )}
                    
                </main>
            </div>

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

export default function AdminDashboard() {
    return (
        <Suspense fallback={<LoadingOverlay message="Cargando panel de administración..." />}>
            <AdminDashboardContent />
        </Suspense>
    )
}

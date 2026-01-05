import { Suspense } from "react"
import StudentDashboard from "@/components/custom/Dashboard"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"

export default function StudentPage() {
    return (
        <Suspense fallback={<LoadingOverlay message="Cargando panel..." />}>
            <StudentDashboard />
        </Suspense>
    )
}

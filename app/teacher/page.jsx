import { Suspense } from "react"
import TeacherMain from "@/components/custom/TeacherMain";
import { LoadingOverlay } from "@/components/custom/LoadingOverlay";

export default function TeacherPage() {
    return (
        <Suspense fallback={<LoadingOverlay message="Cargando panel docente..." />}>
            <TeacherMain />
        </Suspense>
    );
}
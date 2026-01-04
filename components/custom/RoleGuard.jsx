// /home/edgar/Proyecto ADS/proyecto_ads/components/custom/RoleGuard.jsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/useAuth"
import { LoadingOverlay } from "./LoadingOverlay"

export default function RoleGuard({ children, allowedRoles }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Si no hay usuario, redirigir a login
                router.push("/login")
            } else if (!allowedRoles.includes(user.role)) {
                // Si el rol no coincide, redirigir al dashboard que le corresponde
                switch (user.role) {
                    case 'admin': router.push('/admin'); break;
                    case 'teacher': router.push('/teacher'); break;
                    case 'student': router.push('/student'); break;
                    case 'tutor': router.push('/padre_tutor'); break;
                    default: router.push('/');
                }
            } else {
                // Si todo está bien, autorizar renderizado
                setAuthorized(true)
            }
        }
    }, [user, loading, allowedRoles, router])

    if (loading || !authorized) {
        return (
            <LoadingOverlay message="Verificando permisos..." />
        )
    }

    return <>{children}</>
}

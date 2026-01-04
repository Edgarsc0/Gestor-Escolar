import RoleGuard from "@/components/custom/RoleGuard"
import { Fade } from "react-awesome-reveal"

export const metadata = {
    title: "Administración",
}

export default function AdminLayout({ children }) {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <Fade className="h-full" triggerOnce>
                {children}
            </Fade>
        </RoleGuard>
    )
}
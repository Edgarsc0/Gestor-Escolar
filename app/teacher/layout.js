import RoleGuard from "@/components/custom/RoleGuard"
import { Fade } from "react-awesome-reveal"

export const metadata = {
  title: "Portal Docente",
}

export default function TeacherLayout({ children }) {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <Fade className="h-full" triggerOnce>
        {children}
      </Fade>
    </RoleGuard>
  )
}
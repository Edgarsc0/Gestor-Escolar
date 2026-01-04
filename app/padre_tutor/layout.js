import RoleGuard from "@/components/custom/RoleGuard"
import { Fade } from "react-awesome-reveal"

export const metadata = {
  title: "Portal de Tutores",
}

export default function TutorLayout({ children }) {
  return (
    <RoleGuard allowedRoles={['tutor']}>
      <Fade className="h-full" triggerOnce>
        {children}
      </Fade>
    </RoleGuard>
  )
}
import { Fade } from "react-awesome-reveal"

export const metadata = {
    title: "Restablecer Contraseña",
}

export default function ResetPasswordLayout({ children }) {
    return (
        <Fade className="h-full" triggerOnce>{children}</Fade>
    )
}

import { Fade } from "react-awesome-reveal"

export const metadata = {
    title: "Recuperar Contraseña",
}

export default function ForgotPasswordLayout({ children }) {
    return (
        <Fade className="h-full" triggerOnce>{children}</Fade>
    )
}

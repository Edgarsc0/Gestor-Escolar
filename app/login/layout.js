import { Fade } from "react-awesome-reveal"

export const metadata = {
    title: "Iniciar Sesión",
}

export default function LoginLayout({ children }) {
    return (
        <Fade className="h-full" triggerOnce>
            {children}
        </Fade>
    )
}
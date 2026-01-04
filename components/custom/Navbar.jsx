
'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

const menuLinks = {
    Administrador: [
        { href: "/admin?view=dashboard", text: "Dashboard" },
        { href: "/admin?view=users", text: "Usuarios" },
        { href: "/admin?view=groups", text: "Grupos" },
        { href: "/admin?view=schedules", text: "Horarios" },
        { href: "/admin?view=justifications", text: "Solicitudes" },
        { href: "/admin?view=upload", text: "Carga Masiva" },
    ],
    Docente: [
        { href: "/teacher?view=groups", text: "Mis grupos" },
        { href: "/teacher?view=grades", text: "Calificaciones" },
        { href: "/teacher?view=schedule", text: "Horario" },
        { href: "/teacher?view=incidents", text: "Incidencias" },
        { href: "/teacher?view=profile", text: "Mi Perfil" },
    ],
    Estudiante: [
        { href: "/home", text: "Inicio" },
        { href: "/grades", text: "Calificaciones" },
        { href: "/schedule", text: "Horario" },
        { href: "/re-enrollment", text: "Reinscripción" },
    ],
    Tutor: [
        { href: "/", text: "Inicio" },
        { href: "/padre_tutor", text: "Mis hijos" },
    ],
};

const NavLink = ({ href, children }) => (
    <Link href={href} className="px-3 py-2 rounded-md text-md font-medium text-gray-200 hover:bg-sky-700 hover:text-white transition-colors duration-200">
        {children}
    </Link>
);

const UserMenu = ({ userType, grado, params }) => {
    let links = menuLinks[userType] || [];

    if (userType === "Estudiante" && ["Preparatoria", "Universidad"].includes(grado)) {
        links = [...links, { href: "/documents", text: "Documentos" }];
    }

    if (userType === "Tutor" && params?.son) {
        links = [
            { href: "/padre_tutor", text: "Mis Hijos" },
            { href: `/padre_tutor/${params.son}?view=academic`, text: "Académico" },
            { href: `/padre_tutor/${params.son}?view=schedule`, text: "Horario" },
            { href: `/padre_tutor/${params.son}?view=incidents`, text: "Incidencias" },
            { href: `/padre_tutor/${params.son}?view=kardex`, text: "Kardex" },
        ];
    }

    return links.map((link) => (
        <NavLink key={link.href} href={link.href}>{link.text}</NavLink>
    ));
};


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { userType, isLoggedIn, grado, logout } = useAuth();
    const params = useParams();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 h-1/12">
            <nav className="flex items-center justify-between flex-wrap p-6 px-4 sm:px-10 bg-blue-950 shadow-md text-white">
                <a href="/" className="flex items-center shrink-0 text-white transition-transform duration-300 ease-in-out hover:scale-105">
                    <img src="/graduation.png" alt="Logo" className="h-10 w-auto mr-4" />
                    <span className="font-semibold text-xl tracking-tight">Sistema de gestión escolar</span>
                    {isLoggedIn ? (
                        <>
                            <span className="mx-3 rounded-full bg-sky-500 p-1 text-sm font-medium" />
                            <span className="text-md tracking-tight">
                                {userType}
                            </span>
                            {userType === "Estudiante" && (
                                <>
                                    <span className="mx-3 rounded-full bg-sky-500 p-1 text-sm font-medium" />
                                    <span className="text-md tracking-tight">
                                        {grado}
                                    </span>
                                </>
                            )}
                        </>
                    ) : null}
                </a>


                <div className="block lg:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
                    >
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
                    </button>
                </div>

                <div className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="text-sm lg:flex-grow lg:text-right mt-4 lg:mt-0">
                        {isLoggedIn ? (
                            <UserMenu userType={userType} grado={grado} params={params} />
                        ) : (
                            <NavLink href="/">Inicio</NavLink>
                        )}
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col lg:flex-row gap-2 items-center">
                        <a href={isLoggedIn ? "/profile" : "/login"} className="inline-block text-base px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-950 hover:bg-white transition-colors duration-200 lg:bg-sky-600 lg:hover:bg-sky-700 lg:border-transparent lg:hover:text-white lg:font-bold lg:hover:scale-105 lg:transition-transform lg:duration-300 lg:ease-in-out">
                            {isLoggedIn ? "Mi Perfil" : "Iniciar Sesión"}
                        </a>
                        {isLoggedIn && (
                            <button onClick={logout} className="p-2 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200" title="Cerrar Sesión">
                                <LogOut className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};
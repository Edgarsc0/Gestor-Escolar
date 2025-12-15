
'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import Link from 'next/link';

// 1. Estructura de datos para los menús
const menuLinks = {
    Administrador: [
        { href: "/dashboard", text: "Dashboard" },
        { href: "/users", text: "Usuarios" },
        { href: "/academic", text: "Académica" },
        { href: "/calendar", text: "Calendario Escolar" },
        { href: "/sanctions", text: "Sanciones y bajas" },
        { href: "/reports", text: "Reportes" },
    ],
    Docente: [
        { href: "/home", text: "Inicio" },
        { href: "/groups", text: "Mis grupos" },
        { href: "/grades", text: "Calificaciones" },
        { href: "/incidents", text: "Incidencias" },
        { href: "/schedule", text: "Horario" },
    ],
    Estudiante: [
        { href: "/home", text: "Inicio" },
        { href: "/grades", text: "Calificaciones" },
        { href: "/schedule", text: "Horario" },
        { href: "/re-enrollment", text: "Reinscripción" },
    ],
    "Padre/Tutor": [
        { href: "/home", text: "Inicio" },
        { href: "/my-children", text: "Mis hijos" },
    ],
};

// 2. Componente NavLink mejorado usando next/link
const NavLink = ({ href, children }) => (
    <Link href={href} className="px-3 py-2 rounded-md text-md font-medium text-gray-200 hover:bg-sky-700 hover:text-white transition-colors duration-200">
        {children}
    </Link>
);

// 3. Componente para renderizar el menú dinámicamente
const UserMenu = ({ userType, grado }) => {
    let links = menuLinks[userType] || [];

    // Lógica especial para Estudiantes de Preparatoria/Universidad
    if (userType === "Estudiante" && ["Preparatoria", "Universidad"].includes(grado)) {
        links = [...links, { href: "/documents", text: "Documentos" }];
    }

    return links.map((link) => (
        <NavLink key={link.href} href={link.href}>{link.text}</NavLink>
    ));
};


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { userType, isLoggedIn, grado } = useAuth();

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
                            <UserMenu userType={userType} grado={grado} />
                        ) : (
                            <NavLink href="/">Inicio</NavLink>
                        )}
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-4">
                        <a href={isLoggedIn ? "/profile" : "/login"} className="inline-block text-base px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-950 hover:bg-white transition-colors duration-200 lg:bg-sky-600 lg:hover:bg-sky-700 lg:border-transparent lg:hover:text-white lg:font-bold lg:hover:scale-105 lg:transition-transform lg:duration-300 lg:ease-in-out">
                            {isLoggedIn ? "Mi Perfil" : "Iniciar Sesión"}
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    );
};
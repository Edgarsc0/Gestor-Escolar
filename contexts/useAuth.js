'use client';

import { createContext, useContext, useState } from 'react';

// 1. Crear el contexto
const AuthContext = createContext();

// 2. Crear el componente Proveedor
export function AuthProvider({ children }) {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userType, setUserType] = useState('Estudiante');
    const [grado, setGrado] = useState('Preparatoria');

    const value = {
        isLoggedIn,
        userType,
        grado,        
        setIsLoggedIn,
        setUserType,
        setGrado,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
    return useContext(AuthContext);
}
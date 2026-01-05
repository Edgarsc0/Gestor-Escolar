'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error("Session check failed", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                
                // Redirección basada en el rol
                if (data.user.role === 'admin') router.push('/admin');
                else if (data.user.role === 'teacher') router.push('/teacher');
                else if (data.user.role === 'student') router.push('/student'); 
                else if (data.user.role === 'tutor') router.push('/padre_tutor');
                else router.push('/');
                
                return { success: true };
            } else {
                const error = await res.json();
                return { success: false, error: error.error };
            }
        } catch (error) {
            return { success: false, error: "Error de conexión" };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isLoggedIn: !!user,
        userType: user?.role === 'admin' ? 'Administrador' : user?.role === 'student' ? 'Estudiante' : user?.role === 'teacher' ? 'Docente' : user?.role === 'tutor' ? 'Tutor' : user?.role,
        grado: user?.grade // Si tienes este campo en el futuro
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
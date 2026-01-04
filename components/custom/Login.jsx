'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingOverlay } from "./LoadingOverlay"

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (!result.success) {
            setError(result.error);
            setLoading(false);
            setErrorDialog({ isOpen: true, title: "Error de inicio de sesión", description: result.error || "Credenciales incorrectas." })
        }
        // Si es exitoso, la redirección la maneja useAuth
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            {loading && <LoadingOverlay message="Iniciando sesión..." />}
            
            <Card className="w-full max-w-md bg-transparent border-none shadow-none">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-white">EduManager</CardTitle>
                    <CardDescription className="text-center text-gray-200">
                        Ingresa tus credenciales para acceder al sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Correo Electrónico</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="nombre@escuela.edu" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="text-white bg-white/10 border-white/20 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Contraseña</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="text-white bg-white/10 border-white/20"
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/forgot_password" className='text-xs text-gray-300 hover:text-white hover:underline'>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </CardFooter>
            </Card>

            <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            {errorDialog.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-700 pt-2">
                            {errorDialog.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>Entendido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await fetch('/api/auth/forgot_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // Siempre mostramos éxito para no revelar si un correo existe o no
            setSuccess(true);
        } catch (err) {
            setError("Error de conexión. Inténtalo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
                    <CardDescription>
                        {success
                            ? "Revisa tu bandeja de entrada."
                            : "Ingresa tu correo para recibir un enlace de recuperación."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                            <p className="text-slate-700">Si una cuenta con el correo <strong>{email}</strong> existe, hemos enviado un enlace para restablecer tu contraseña.</p>
                            <Link href="/login" ><Button variant="outline">Volver a Inicio de Sesión</Button></Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" placeholder="Personal o Institución" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            {error && (<p className="text-sm text-red-500">{error}</p>)}
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Mail className="mr-2 h-4 w-4" /> Enviar Enlace</>}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (<CardFooter className="flex justify-center text-sm"><Link href="/login" className="text-blue-600 hover:underline">Recordé mi contraseña</Link></CardFooter>)}
            </Card>
        </div>
    );
}

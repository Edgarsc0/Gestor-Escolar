import { NextResponse } from "next/server";
import pool from "@/app/api/db/config";
import querys from "@/app/api/db/querys";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(request) {
    const { email, password } = await request.json();
    
    try {
        const result = await pool.query(querys.users.getUserByEmail, [email]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }        
        const user = result.rows[0];        
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        if (user.status !== 'active') {
            return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
        }

        // Crear JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        const token = await new SignJWT({ id: user.id, role: user.role, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json({
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

        response.cookies.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 horas
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

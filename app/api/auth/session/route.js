import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import pool from "@/app/api/db/config";
import querys from "@/app/api/db/querys";

export async function GET(request) {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        const { payload } = await jwtVerify(token, secret);

        // Obtener datos frescos del usuario
        const result = await pool.query(querys.users.getUserById, [payload.id]);
        if (result.rows.length === 0) {
            return NextResponse.json({ user: null });
        }

        const user = result.rows[0];
        delete user.password_hash; // No enviar el hash

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}

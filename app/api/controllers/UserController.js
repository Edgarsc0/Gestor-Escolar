// app/api/controllers/UserController.js
import { NextResponse } from "next/server";
import UserService from "../services/UserService";
import { jwtVerify } from "jose";

const getUserId = async (req) => {
    const token = req.cookies.get('session_token');
    if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        try {
            const { payload } = await jwtVerify(token.value, secret);
            return payload.id;
        } catch {}
    }
    return null;
};

export default class UserController {
    constructor() {
        this.service = new UserService();
    }

    getAllUsers = async (req) => {
        try {
            const { searchParams } = new URL(req.url);
            console.log(searchParams)            
            const role = searchParams.get('role');
            const users = await this.service.getAllUsers(role);
            
            // Removemos el hash del password antes de enviarlo al cliente
            const sanitizedUsers = users.map(user => {
                const { password_hash, ...rest } = user;
                return rest;
            });
            return NextResponse.json(sanitizedUsers);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getUserById = async (req, { params }) => {
        try {
            const { id } = await params;
            const user = await this.service.getUserById(id);
            const { password_hash, ...rest } = user;
            return NextResponse.json(rest);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    createUser = async (req) => {
        try {
            const body = await req.json();
            const adminId = await getUserId(req);
            const user = await this.service.createUser(body, adminId);
            const { password_hash, ...rest } = user;
            return NextResponse.json(rest, { status: 201 });
        } catch (error) {
            console.error("Error creating user:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    updateUser = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const adminId = await getUserId(req);
            const user = await this.service.updateUser(id, body, adminId);
            const { password_hash, ...rest } = user;
            return NextResponse.json(rest);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    deleteUser = async (req, { params }) => {
        try {
            const { id } = await params;
            const { searchParams } = new URL(req.url);
            const force = searchParams.get('force') === 'true';
            const adminId = await getUserId(req);

            const result = await this.service.deleteUser(id, force, adminId);
            return NextResponse.json(result);
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.message === "TEACHER_ASSIGNED") {
                return NextResponse.json({ 
                    error: "El profesor tiene asignaciones activas", 
                    assignments: error.assignments 
                }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: error.message === "User not found or could not be deleted" ? 404 : 500 });
        }
    };

    changePassword = async (req) => {
        try {
            const body = await req.json();
            const { userId, currentPassword, newPassword } = body;

            if (!userId || !currentPassword || !newPassword) {
                return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
            }
            await this.service.changePassword(userId, currentPassword, newPassword);
            return NextResponse.json({ message: "Contraseña actualizada correctamente." });
        } catch (error) {            
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
    };

    forgotPassword = async (req) => {
        try {
            const { email } = await req.json();
            if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
            
            await this.service.requestPasswordReset(email);
            return NextResponse.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación." });
        } catch (error) {
            console.error("Forgot password error:", error);
            return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
        }
    };

    resetPassword = async (req) => {
        try {
            const { token, newPassword } = await req.json();
            if (!token || !newPassword) return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });

            await this.service.resetPasswordWithToken(token, newPassword);
            return NextResponse.json({ message: "Contraseña actualizada correctamente." });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    };
}

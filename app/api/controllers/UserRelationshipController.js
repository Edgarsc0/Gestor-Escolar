// app/api/controllers/UserRelationshipController.js
import { NextResponse } from "next/server";
import UserRelationshipService from "../services/UserRelationshipService";
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

export default class UserRelationshipController {
    constructor() {
        this.service = new UserRelationshipService();
    }

    create = async (req) => {
        try {
            const body = await req.json();
            const adminId = await getUserId(req);
            const result = await this.service.create(body, adminId);
            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            console.error("Error creating relationship:", error);
            if (error.message === "RELATIONSHIP_EXISTS") {
                return NextResponse.json({ error: "La relación entre este alumno y tutor ya existe." }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getAll = async (req) => {
        try {
            const results = await this.service.getAll();
            return NextResponse.json(results);
        } catch (error) {
            console.error("Error getting relationships:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getByStudent = async (req, { params }) => {
        try {
            const { id } = await params; // Student ID
            const results = await this.service.getByStudentId(id);
            return NextResponse.json(results);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getByTutor = async (req, { params }) => {
        try {
            const { id } = await params; // Tutor ID
            const results = await this.service.getByTutorId(id);
            return NextResponse.json(results);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    delete = async (req, { params }) => {
        try {
            const { id } = await params; // Relationship ID
            const adminId = await getUserId(req);
            const result = await this.service.delete(id, adminId);
            return NextResponse.json(result);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}

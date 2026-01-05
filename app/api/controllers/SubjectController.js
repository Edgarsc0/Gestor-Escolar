import { NextResponse } from "next/server";
import SubjectService from "../services/SubjectService";
import { jwtVerify } from "jose";

const getUserId = async (req) => {
    const token = req.cookies.get('session_token');
    if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        try {
            const { payload } = await jwtVerify(token.value, secret);
            return payload.id;
        } catch { }
    }
    return null;
};

export default class SubjectController {
    constructor() {
        this.service = new SubjectService();
    }

    getAll = async (req) => {
        try {
            const { searchParams } = new URL(req.url);
            const levelId = searchParams.get('academic_level_id');
            let subjects;
            if (levelId) {
                subjects = await this.service.getSubjectsByLevel(levelId);
            } else {
                subjects = await this.service.getAll();
            }
            return NextResponse.json(subjects);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getById = async (req, { params }) => {
        try {
            const { id } = await params;
            const subject = await this.service.getSubjectById(id);
            return NextResponse.json(subject);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    };

    create = async (req) => {
        try {
            const body = await req.json();
            const adminId = await getUserId(req);
            const newSubject = await this.service.create(body, adminId);
            return NextResponse.json(newSubject, { status: 201 });
        } catch (error) {
            const status = error.message.includes("already exists") ? 409 : 500;
            return NextResponse.json({ error: error.message }, { status });
        }
    };

    update = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const adminId = await getUserId(req);
            const updatedSubject = await this.service.update(id, body, adminId);
            return NextResponse.json(updatedSubject);
        } catch (error) {
            const status = error.message.includes("already exists") ? 409 : error.message.includes("not found") ? 404 : 500;
            return NextResponse.json({ error: error.message }, { status });
        }
    };

    delete = async (req, { params }) => {
        try {
            const { id } = await params;
            const adminId = await getUserId(req);
            const result = await this.service.delete(id, adminId);
            return NextResponse.json(result);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    };
}
import { NextResponse } from "next/server";
import GradeService from "../services/GradeService";
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

export default class GradeController {
    constructor() {
        this.service = new GradeService();
    }

    get = async (req) => {
        try {
            const { searchParams } = new URL(req.url);
            const groupId = searchParams.get('group_id');
            const subjectId = searchParams.get('subject_id');
            if (!groupId || !subjectId) return NextResponse.json({ error: "group_id and subject_id are required" }, { status: 400 });

            const grades = await this.service.getGrades(groupId, subjectId);
            return NextResponse.json(grades);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    save = async (req) => {
        try {
            const body = await req.json();
            const userId = await getUserId(req);
            const savedGrades = await this.service.saveGrades(body, userId);
            return NextResponse.json(savedGrades, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getStudentGrades = async (req, { params }) => {
        try {
            const { id } = await params;
            const grades = await this.service.getStudentGrades(id);
            return NextResponse.json(grades);
        } catch (error) {
            console.error("Error fetching student grades:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getStudentKardex = async (req, { params }) => {
        try {
            const { id } = await params;
            const kardex = await this.service.getStudentKardex(id);
            return NextResponse.json(kardex);
        } catch (error) {
            console.error("Error fetching student kardex:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
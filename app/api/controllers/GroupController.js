// app/api/controllers/GroupController.js
import { NextResponse } from "next/server";
import GroupService from "../services/GroupService";
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

export default class GroupController {
    constructor() {
        this.service = new GroupService();
    }

    getAllGroups = async (req) => {
        try {
            const groups = await this.service.getAllGroups();
            return NextResponse.json(groups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getGroupById = async (req, { params }) => {
        try {
            const { id } = await params;
            const group = await this.service.getGroupById(id);
            return NextResponse.json(group);
        } catch (error) {
            console.error("Error fetching group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    createGroup = async (req) => {
        try {
            const body = await req.json();
            const adminId = await getUserId(req);
            const group = await this.service.createGroup(body, adminId);
            return NextResponse.json(group, { status: 201 });
        } catch (error) {
            console.error("Error creating group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    updateGroup = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const adminId = await getUserId(req);
            const group = await this.service.updateGroup(id, body, adminId);
            return NextResponse.json(group);
        } catch (error) {
            console.error("Error updating group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    deleteGroup = async (req, { params }) => {
        try {
            const { id } = await params;
            const adminId = await getUserId(req);
            const result = await this.service.deleteGroup(id, adminId);
            return NextResponse.json(result);
        } catch (error) {
            console.error("Error deleting group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    
    getGroupStudents = async (req, { params }) => {
        try {
            const { id } = await params; // Group ID
            const students = await this.service.getGroupStudents(id);
            return NextResponse.json(students);
        } catch (error) {
            console.error("Error fetching group students:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    addStudent = async (req, { params }) => {
        try {
            const { id } = await params; // Group ID
            const body = await req.json();
            const { student_id } = body;
            const result = await this.service.addStudentToGroup(student_id, id);
            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            console.error("Error adding student to group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    removeStudent = async (req, { params }) => {
        try {
            const { id, studentId } = await params; // Group ID y Student ID
            const adminId = await getUserId(req);
            await this.service.removeStudentFromGroup(studentId, id, adminId);
            return NextResponse.json({ message: "Student removed from group" });
        } catch (error) {
            console.error("Error removing student from group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    enroll = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const { student_ids } = body;

            if (!id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
                return NextResponse.json({ error: "Datos de inscripción inválidos" }, { status: 400 });
            }

            const adminId = await getUserId(req);
            await this.service.enrollStudents(id, student_ids, adminId);

            return NextResponse.json({ 
                message: "Alumnos inscritos correctamente",
                count: student_ids.length
            });

        } catch (error) {
            console.error("Error enrolling students:", error);
            if (error.message === "GROUP_NOT_FOUND") {
                return NextResponse.json({ error: "El grupo no existe" }, { status: 404 });
            }
            if (error.message.startsWith("CAPACITY_EXCEEDED")) {
                return NextResponse.json({ error: error.message.split(": ")[1] }, { status: 409 });
            }
            return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
        }
    };

    getAllEnrollments = async (req) => {
        try {
            const enrollments = await this.service.getAllStudentEnrollments();
            return NextResponse.json(enrollments);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    emptyGroup = async (req, { params }) => {
        try {
            const { id } = await params;
            const adminId = await getUserId(req);
            await this.service.emptyGroup(id, adminId);
            return NextResponse.json({ message: "Group emptied successfully" });
        } catch (error) {
            console.error("Error emptying group:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}

import { NextResponse } from "next/server";
import AttendanceService from "../services/AttendanceService";

export default class AttendanceController {
    constructor() {
        this.service = new AttendanceService();
    }

    async register(request) {
        try {
            const data = await request.json();
            const result = await this.service.registerAttendanceBatch(data);
            return NextResponse.json({ message: "Asistencia registrada correctamente", data: result });
        } catch (error) {
            console.error("Error registering attendance:", error);
            return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
        }
    }

    async getSheet(request) {
        try {
            const { searchParams } = new URL(request.url);
            const groupId = searchParams.get('group_id');
            const subjectId = searchParams.get('subject_id');
            const date = searchParams.get('date');
            const studentId = searchParams.get('student_id');
            const teacherId = searchParams.get('teacher_id');

            if (studentId) {
                const result = await this.service.getStudentHistory(studentId);
                return NextResponse.json(result);
            }

            if (teacherId) {
                const result = await this.service.getTeacherHistory(teacherId);
                return NextResponse.json(result);
            }

            const result = await this.service.getAttendanceSheet(groupId, subjectId, date);
            return NextResponse.json(result);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
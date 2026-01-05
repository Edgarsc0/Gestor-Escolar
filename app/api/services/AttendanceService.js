import AttendanceRepository from "../repository/AttendanceRepository";

export default class AttendanceService {
    constructor() {
        this.repository = new AttendanceRepository();
    }

    async registerAttendanceBatch(data) {
        // data espera: { teacher_id, group_id, subject_id, date, students: [{ student_id, status }] }
        const { teacher_id, group_id, subject_id, date, students } = data;

        const attendanceList = students.map(student => ({
            student_id: student.student_id,
            teacher_id,
            group_id,
            subject_id,
            date,
            status: student.status || 'presente'
        }));

        return await this.repository.bulkUpsert(attendanceList);
    }

    async getAttendanceSheet(groupId, subjectId, date) {
        // Aquí podrías agregar lógica extra, como validar que el usuario que consulta tenga permisos
        return await this.repository.getByFilters(groupId, subjectId, date);
    }

    async getStudentHistory(studentId) {
        return await this.repository.getByStudentId(studentId);
    }

    async getTeacherHistory(teacherId) {
        return await this.repository.getByTeacherId(teacherId);
    }
}
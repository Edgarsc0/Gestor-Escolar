export default class AttendanceModel {
    constructor(id, student_id, teacher_id, group_id, subject_id, date, status, created_at, updated_at, student_name = null, subject_name = null, teacher_name = null, group_name = null) {
        this.id = id;
        this.student_id = student_id;
        this.teacher_id = teacher_id;
        this.group_id = group_id;
        this.subject_id = subject_id;
        this.date = date;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.student_name = student_name; // Campo extra para facilitar la visualización en el frontend
        this.subject_name = subject_name;
        this.teacher_name = teacher_name;
        this.group_name = group_name;
    }
}
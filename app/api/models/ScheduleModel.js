export default class Schedule {
    constructor(id, group_id, day_of_week, start_time, end_time, subject_id, teacher_id, created_at, teacher_name, subject_name) {
        this.id = id;
        this.group_id = group_id;
        this.day_of_week = day_of_week;
        this.start_time = start_time;
        this.end_time = end_time;
        this.subject_id = subject_id;
        this.teacher_id = teacher_id;
        this.created_at = created_at;
        this.teacher_name = teacher_name || null; // Propiedad extendida (JOIN)
        this.subject_name = subject_name || null; // Propiedad extendida (JOIN)
    }
}
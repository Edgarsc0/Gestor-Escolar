// app/api/models/Group.js
export default class Group {
    constructor(id, name, academic_level_id, main_teacher_id, capacity, created_at, level_name = null, teacher_name = null) {
        this.id = id;
        this.name = name;
        this.academic_level_id = academic_level_id;
        this.main_teacher_id = main_teacher_id;
        this.capacity = capacity;
        this.created_at = created_at;

        // Campos opcionales para vistas enriquecidas (JOINs)
        this.level_name = level_name;
        this.teacher_name = teacher_name;
    }
}

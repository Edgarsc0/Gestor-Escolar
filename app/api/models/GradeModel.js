export default class GradeModel {
    constructor(id, student_id, group_id, subject_id, partial_1, partial_2, partial_3, final_grade, school_cycle, created_at, updated_at) {
        this.id = id;
        this.student_id = student_id;
        this.group_id = group_id;
        this.subject_id = subject_id;
        this.partial_1 = partial_1;
        this.partial_2 = partial_2;
        this.partial_3 = partial_3;
        this.final_grade = final_grade;
        this.school_cycle = school_cycle;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
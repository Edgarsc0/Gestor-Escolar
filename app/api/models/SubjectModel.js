export default class SubjectModel {
    constructor(id, name, academic_level_id, description, creditos, created_at, academic_level_name) {
        this.id = id;
        this.name = name;
        this.academic_level_id = academic_level_id;
        this.description = description;
        this.creditos = creditos;
        this.created_at = created_at;
        this.academic_level_name = academic_level_name; // From JOIN
    }
}
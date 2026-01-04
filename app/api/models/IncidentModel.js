export default class IncidentModel {
    constructor(id, student_id, reporter_id, type, date, description, status, created_at, updated_at) {
        this.id = id;
        this.student_id = student_id;
        this.reporter_id = reporter_id;
        this.type = type;
        this.date = date;
        this.description = description;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
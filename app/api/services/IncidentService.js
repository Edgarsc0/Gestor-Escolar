import IncidentRepository from "../repository/IncidentRepository";

export default class IncidentService {
    constructor() {
        this.repository = new IncidentRepository();
    }

    async createIncident(data) {
        if (!data.student_id || !data.reporter_id || !data.type || !data.date) {
            throw new Error("Student, reporter, type, and date are required.");
        }
        return await this.repository.create(data);
    }

    async getIncidentsByStudent(studentId) {
        return await this.repository.getByStudentId(studentId);
    }

    async getAllIncidents() {
        return await this.repository.getAll();
    }

    async updateIncidentStatus(id, status) {
        return await this.repository.updateStatus(id, status);
    }

    async getIncidentsByReporter(reporterId) {
        return await this.repository.getByReporterId(reporterId);
    }
}
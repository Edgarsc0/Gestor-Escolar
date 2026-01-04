import UserRelationshipRepository from "../repository/UserRelationshipRepository";
import ActivityLogService from "./ActivityLogService";

export default class UserRelationshipService {
    constructor() {
        this.repository = new UserRelationshipRepository();
        this.logService = new ActivityLogService();
    }

    async getAll() {
        return await this.repository.getAll();
    }

    async create(data, adminId) {
        const newRel = await this.repository.create(data);
        this.logService.logActivity(adminId, `Asignó al tutor ID ${data.tutor_id} al alumno ID ${data.student_id}.`);
        return newRel;
    }

    async getByStudentId(studentId) {
        return await this.repository.getByStudentId(studentId);
    }

    async getByTutorId(tutorId) {
        return await this.repository.getByTutorId(tutorId);
    }

    async delete(id, adminId) {
        const result = await this.repository.delete(id);
        this.logService.logActivity(adminId, `Eliminó la relación de tutor con ID ${id}.`);
        return result;
    }
}
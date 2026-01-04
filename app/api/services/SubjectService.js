import SubjectRepository from "../repository/SubjectRepository";
import ActivityLogService from "./ActivityLogService";

export default class SubjectService {
    constructor() {
        this.repository = new SubjectRepository();
        this.logService = new ActivityLogService();
    }

    async getAll() {
        return await this.repository.getAll();
    }

    async getSubjectById(id) {
        return await this.repository.getById(id);
    }

    async getSubjectsByLevel(levelId) {
        return await this.repository.getByAcademicLevel(levelId);
    }

    async create(data, adminId) {
        const newSubject = await this.repository.create(data);
        this.logService.logActivity(adminId, `Creó la materia "${newSubject.name}".`);
        return newSubject;
    }

    async update(id, data, adminId) {
        const updatedSubject = await this.repository.update(id, data);
        this.logService.logActivity(adminId, `Actualizó la materia "${updatedSubject.name}".`);
        return updatedSubject;
    }

    async delete(id, adminId) {
        const result = await this.repository.delete(id);
  
        this.logService.logActivity(adminId, `Eliminó la materia con ID ${id}.`);
        return result;
    }
}
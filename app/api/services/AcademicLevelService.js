// app/api/services/AcademicLevelService.js
import AcademicLevelRepository from "../repository/AcademicLevelRepository";

export default class AcademicLevelService {
    constructor() {
        this.repository = new AcademicLevelRepository();
    }

    async getAll() {
        return await this.repository.getAll();
    }
}

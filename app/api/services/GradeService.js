import GradeRepository from "../repository/GradeRepository";
import ActivityLogService from "./ActivityLogService";

export default class GradeService {
    constructor() {
        this.repository = new GradeRepository();
        this.logService = new ActivityLogService();
    }

    getCurrentSchoolCycle() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; 
        const currentYear = now.getFullYear();
        
        if (currentMonth >= 8) { 
            return `${currentYear}-${currentYear + 1}`;
        } else { 
            return `${currentYear - 1}-${currentYear}`;
        }
    }

    async getGrades(groupId, subjectId) {
        const schoolCycle = this.getCurrentSchoolCycle();
        return await this.repository.getByGroupAndSubject(groupId, subjectId, schoolCycle);
    }

    async saveGrades(gradesData, userId) {
        const schoolCycle = this.getCurrentSchoolCycle();
        const promises = gradesData.map(grade => {
            const payload = { ...grade, school_cycle: schoolCycle };
            return this.repository.upsert(payload);
        });
        const results = await Promise.all(promises);
        if (gradesData.length > 0) {
            
            this.logService.logActivity(userId, `Guardó/actualizó ${gradesData.length} calificaciones para la materia ID ${gradesData[0].subject_id} en el grupo ID ${gradesData[0].group_id}.`);
        }
        return results;
    }

    async getStudentGrades(studentId) {
        const schoolCycle = this.getCurrentSchoolCycle();
        return await this.repository.getGradesByStudentId(studentId, schoolCycle);
    }

    async getStudentKardex(studentId) {
        return await this.repository.getKardexByStudentId(studentId);
    }
}
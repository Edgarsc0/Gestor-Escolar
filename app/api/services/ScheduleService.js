import ScheduleRepository from "../repository/ScheduleRepository";
import ActivityLogService from "./ActivityLogService";

export default class ScheduleService {
    constructor() {
        this.repository = new ScheduleRepository();
        this.logService = new ActivityLogService();
    }

    async getSchedulesByGroup(groupId) {
        return await this.repository.getByGroupId(groupId);
    }

    async createSchedule(data, adminId) {
        // Validaciones básicas - Updated to check for subject_id instead of subject
        if (!data.group_id || !data.day_of_week || !data.start_time || !data.end_time || !data.subject_id) {
            throw new Error("Missing required fields");
        }
        
        const newSchedule = await this.repository.create(data);
        this.logService.logActivity(adminId, `Creó una nueva clase para el grupo ID ${data.group_id} el día ${data.day_of_week}.`);
        return newSchedule;
    }

    async updateSchedule(id, data, adminId) {
        if (!data.day_of_week || !data.start_time || !data.end_time || !data.subject_id) {
             throw new Error("Missing required fields");
        }
        const updatedSchedule = await this.repository.update(id, data);
        this.logService.logActivity(adminId, `Actualizó la clase ID ${id}.`);
        return updatedSchedule;
    }

    async deleteSchedule(id, adminId) {
        const result = await this.repository.delete(id);
        this.logService.logActivity(adminId, `Eliminó la clase con ID ${id}.`);
        return result;
    }

    async deleteByGroupId(groupId, adminId) {
        const result = await this.repository.deleteByGroupId(groupId);
        this.logService.logActivity(adminId, `Vació el horario completo del grupo ID ${groupId}.`);
        return result;
    }

    async deleteByGroupIdAndDay(groupId, day, adminId) {
        const result = await this.repository.deleteByGroupIdAndDay(groupId, day);
        this.logService.logActivity(adminId, `Vació el día ${day} del horario del grupo ID ${groupId}.`);
        return result;
    }

    async getStudentSchedule(studentId) {
        return await this.repository.getByStudentId(studentId);
    }
}
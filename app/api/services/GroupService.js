import GroupRepository from "../repository/GroupRepository";
import ActivityLogService from "./ActivityLogService";

export default class GroupService {
    constructor() {
        this.repository = new GroupRepository();
        this.logService = new ActivityLogService();
    }

    async getAllGroups() {
        return await this.repository.getAllGroups();
    }

    async getGroupById(id) {
        const group = await this.repository.getGroupById(id);
        if (!group) {
            throw new Error("Group not found");
        }
        // Opcional: Cargar alumnos automáticamente al pedir un grupo individual
        const students = await this.repository.getStudentsByGroupId(id);
        group.students = students;
        return group;
    }

    async createGroup(groupData, adminId) {
        if (!groupData.name || !groupData.academic_level_id) {
            throw new Error("Name and Academic Level are required");
        }
        const newGroup = await this.repository.createGroup(groupData);
        this.logService.logActivity(adminId, `Creó el grupo "${newGroup.name}".`);
        return newGroup;
    }

    async updateGroup(id, groupData, adminId) {
        const updatedGroup = await this.repository.updateGroup(id, groupData);
        if (!updatedGroup) {
            throw new Error("Group not found or update failed");
        }
        this.logService.logActivity(adminId, `Actualizó el grupo "${updatedGroup.name}".`);
        return updatedGroup;
    }

    async deleteGroup(id, adminId) {
        const result = await this.repository.deleteGroup(id);
        if (!result) {
            throw new Error("Group not found or could not be deleted");
        }
        this.logService.logActivity(adminId, `Eliminó el grupo con ID ${id}.`);
        return { message: "Group deleted successfully" };
    }

    async getGroupStudents(groupId) {
        return await this.repository.getStudentsByGroupId(groupId);
    }

    async addStudentToGroup(studentId, groupId) {
        // Aquí podrías validar capacidad del grupo antes de insertar
        return await this.repository.addStudentToGroup(studentId, groupId);
    }

    async removeStudentFromGroup(studentId, groupId, adminId) {
        const result = await this.repository.removeStudentFromGroup(studentId, groupId);
        this.logService.logActivity(adminId, `Dio de baja al alumno ID ${studentId} del grupo ID ${groupId}.`);
        return result;
    }

    async emptyGroup(groupId, adminId) {
        const result = await this.repository.removeAllStudentsFromGroup(groupId);
        this.logService.logActivity(adminId, `Vació todos los alumnos del grupo ID ${groupId}.`);
        return result;
    }

    async enrollStudents(groupId, studentIds, adminId) {
        const group = await this.repository.getGroupById(groupId);
        if (!group) throw new Error("GROUP_NOT_FOUND");

        const currentCount = await this.repository.getStudentCount(groupId);
        if (currentCount + studentIds.length > group.capacity) {
            throw new Error(`CAPACITY_EXCEEDED: El grupo tiene ${group.capacity - currentCount} lugares disponibles.`);
        }

        const result = await this.repository.transferStudents(groupId, studentIds);
        this.logService.logActivity(adminId, `Inscribió ${studentIds.length} alumnos en el grupo ID ${groupId}.`);
        return result;
    }

    async getAllStudentEnrollments() {
        return await this.repository.getAllStudentEnrollments();
    }
}
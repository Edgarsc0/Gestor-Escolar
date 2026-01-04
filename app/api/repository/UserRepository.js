import pool from "../db/config";
import querys from "../db/querys";

export default class UserRepository {

    async getAllUsers(role) {
        const query = role ? querys.users.getUsersByRole : querys.users.getAllUsers;
        const params = role ? [role] : [];
        const result = await pool.query(query, params);
        return result.rows;
    }

    async getUserById(id) {
        const result = await pool.query(querys.users.getUserById, [id]);
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const result = await pool.query(querys.users.getUserByEmail, [email]);
        return result.rows[0];
    }

    async getUserByAnyEmail(email) {
        const result = await pool.query(querys.users.getUserByAnyEmail, [email]);
        return result.rows[0];
    }

    async createUser(userData) {
        const { full_name, birth_date, password_hash, role, status } = userData;
        try {
            const result = await pool.query(querys.users.createUser, [full_name, birth_date, password_hash, role, status]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'users_pkey') {
                await pool.query(querys.users.fixSequence);
                const result = await pool.query(querys.users.createUser, [full_name, birth_date, password_hash, role, status]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async updateUser(id, userData) {
        const { full_name, birth_date, role, status } = userData;
        const result = await pool.query(querys.users.updateUser, [full_name, birth_date, role, status, id]);
        return result.rows[0];
    }

    async updatePassword(id, password_hash) {
        await pool.query(querys.users.updatePassword, [password_hash, id]);
    }

    async deleteUser(id) {
        const result = await pool.query(querys.users.deleteUser, [id]);
        return result.rowCount > 0;
    }

    async getTeacherAssignments(id) {
        const groupsRes = await pool.query(querys.users.getTeacherAssignmentsGroups, [id]);
        const schedulesRes = await pool.query(querys.users.getTeacherAssignmentsSchedules, [id]);
        
        return {
            groups: groupsRes.rows,
            schedules: schedulesRes.rows
        };
    }

    async nullifyTeacherReferences(id) {
        await pool.query(querys.groups.unlinkTeacher, [id]);
        await pool.query(querys.schedules.unlinkTeacher, [id]);
    }
}
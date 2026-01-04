import pool from "../db/config";
import querys from "../db/querys";

export default class ScheduleRepository {

    async getByGroupId(groupId) {
        const result = await pool.query(querys.schedules.getByGroupId, [groupId]);
        return result.rows;
    }

    async create(data) {
        const { group_id, day_of_week, start_time, end_time, subject_id, teacher_id } = data;
        try {
            const result = await pool.query(querys.schedules.create, [group_id, day_of_week, start_time, end_time, subject_id, teacher_id]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'schedules_pkey') {
                await pool.query(querys.schedules.fixSequence);
                const result = await pool.query(querys.schedules.create, [group_id, day_of_week, start_time, end_time, subject_id, teacher_id]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async update(id, data) {
        const { day_of_week, start_time, end_time, subject_id, teacher_id } = data;
        const result = await pool.query(querys.schedules.update, [day_of_week, start_time, end_time, subject_id, teacher_id, id]);
        return result.rows[0];
    }

    async delete(id) {
        const result = await pool.query(querys.schedules.delete, [id]);
        return result.rowCount > 0;
    }

    async deleteByGroupId(groupId) {
        const result = await pool.query(querys.schedules.deleteByGroupId, [groupId]);
        return result.rowCount > 0;
    }

    async deleteByGroupIdAndDay(groupId, day) {
        const result = await pool.query(querys.schedules.deleteByGroupIdAndDay, [groupId, day]);
        return result.rowCount > 0;
    }
    
    async getById(id) {
        const result = await pool.query(querys.schedules.getById, [id]);
        return result.rows[0];
    }

    async getByStudentId(studentId) {
        const result = await pool.query(querys.schedules.getByStudentId, [studentId]);
        return result.rows;
    }
}
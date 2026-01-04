import pool from "../db/config";
import querys from "../db/querys";

export default class IncidentRepository {
    async create(data) {
        const { student_id, reporter_id, type, date, description, status } = data;
        try {
            const result = await pool.query(querys.incidents.create, [student_id, reporter_id, type, date, description, status || 'Pendiente por justificar']);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'incidents_pkey') {
                await pool.query(querys.incidents.fixSequence);
                const result = await pool.query(querys.incidents.create, [student_id, reporter_id, type, date, description, status || 'Pendiente por justificar']);
                return result.rows[0];
            }
            throw error;
        }
    }

    async getByStudentId(studentId) {
        const result = await pool.query(querys.incidents.getByStudentId, [studentId]);
        return result.rows;
    }

    async getAll() {
        const result = await pool.query(querys.incidents.getAll);
        return result.rows;
    }

    async updateStatus(id, status) {
        const result = await pool.query(querys.incidents.updateStatus, [status, id]);
        return result.rows[0];
    }

    async getByReporterId(reporterId) {
        const result = await pool.query(querys.incidents.getByReporterId, [reporterId]);
        return result.rows;
    }
}
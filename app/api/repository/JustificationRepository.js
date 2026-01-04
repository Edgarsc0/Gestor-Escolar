import pool from "../db/config";
import querys from "../db/querys";

export default class JustificationRepository {
    async create(data) {
        const { incident_id, tutor_id, reason, evidence_urls } = data;
        try {
            const result = await pool.query(querys.justifications.create, [incident_id, tutor_id, reason, evidence_urls]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'justifications_pkey') {
                await pool.query(querys.justifications.fixSequence);
                const result = await pool.query(querys.justifications.create, [incident_id, tutor_id, reason, evidence_urls]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async getByIncidentId(incidentId) {
        const result = await pool.query(querys.justifications.getByIncidentId, [incidentId]);
        return result.rows[0];
    }

    async update(id, data) {
        const { admin_comment, reviewed_by } = data;
        const result = await pool.query(querys.justifications.update, [admin_comment, reviewed_by, id]);
        return result.rows[0];
    }

    async getAllPending() {
        const result = await pool.query(querys.justifications.getAllPending);
        return result.rows;
    }
}
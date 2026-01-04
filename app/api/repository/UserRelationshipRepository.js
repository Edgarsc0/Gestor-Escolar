// app/api/repository/UserRelationshipRepository.js
import UserRelationship from "../models/UserRelationshipModel";
import pool from "../db/config";
import querys from "../db/querys";

export default class UserRelationshipRepository {

    async getAll() {
        const result = await pool.query(querys.userRelationships.getAll);
        return result.rows;
    }

    async create(data) {
        const { student_id, tutor_id, relationship_type } = data;
        try {
            const result = await pool.query(querys.userRelationships.create, [student_id, tutor_id, relationship_type]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'user_relationships_pkey') {
                await pool.query(querys.userRelationships.fixSequence);
                const result = await pool.query(querys.userRelationships.create, [student_id, tutor_id, relationship_type]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async getByStudentId(studentId) {
        const result = await pool.query(querys.userRelationships.getByStudentId, [studentId]);
        return result.rows.map(row => {
            const { id, student_id, tutor_id, relationship_type, ...extra } = row;
            return new UserRelationship(id, student_id, tutor_id, relationship_type, extra);
        });
    }

    async getByTutorId(tutorId) {
        const result = await pool.query(querys.userRelationships.getByTutorId, [tutorId]);
        return result.rows.map(row => {
            const { id, student_id, tutor_id, relationship_type, ...extra } = row;
            return new UserRelationship(id, student_id, tutor_id, relationship_type, extra);
        });
    }

    async delete(id) {
        const result = await pool.query(querys.userRelationships.delete, [id]);
        return result.rowCount > 0;
    }

    async deleteByPair(studentId, tutorId) {
        const result = await pool.query(querys.userRelationships.deleteByPair, [studentId, tutorId]);
        return result.rowCount > 0;
    }
}

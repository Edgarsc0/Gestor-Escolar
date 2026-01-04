import pool from "../db/config";
import querys from "../db/querys";

export default class GradeRepository {

    async getByGroupAndSubject(groupId, subjectId, schoolCycle) {
        const result = await pool.query(querys.grades.getByGroupAndSubject, [groupId, subjectId, schoolCycle]);
        return result.rows;
    }

    async upsert(data) {
        const { student_id, subject_id, group_id, partial_1, partial_2, partial_3, final_grade, school_cycle } = data;
        try {
            const result = await pool.query(querys.grades.upsert, [student_id, subject_id, group_id, partial_1, partial_2, partial_3, final_grade, school_cycle]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'grades_pkey') {
                await pool.query(querys.grades.fixSequence);
                const result = await pool.query(querys.grades.upsert, [student_id, subject_id, group_id, partial_1, partial_2, partial_3, final_grade, school_cycle]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async getGradesByStudentId(studentId, schoolCycle) {
        const result = await pool.query(querys.grades.getByStudentId, [studentId, schoolCycle]);
        return result.rows;
    }

    async getKardexByStudentId(studentId) {
        const result = await pool.query(querys.grades.getKardex, [studentId]);
        return result.rows;
    }
}
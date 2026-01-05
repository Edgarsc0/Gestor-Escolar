import pool from "../db/config";
import AttendanceModel from "../models/AttendanceModel";

export default class AttendanceRepository {

    // Registra o actualiza asistencia (soporta masivo)
    async bulkUpsert(attendanceList) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const results = [];
            
            const query = `
                INSERT INTO attendance (student_id, teacher_id, group_id, subject_id, date, status, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                ON CONFLICT (student_id, subject_id, date)
                DO UPDATE SET 
                    status = EXCLUDED.status, 
                    teacher_id = EXCLUDED.teacher_id, 
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
            `;

            for (const item of attendanceList) {
                const { student_id, teacher_id, group_id, subject_id, date, status } = item;
                const res = await client.query(query, [student_id, teacher_id, group_id, subject_id, date, status]);
                const row = res.rows[0];
                results.push(new AttendanceModel(row.id, row.student_id, row.teacher_id, row.group_id, row.subject_id, row.date, row.status, row.created_at, row.updated_at));
            }

            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Obtener lista de asistencia filtrada
    async getByFilters(groupId, subjectId, date) {
        const query = `
            SELECT a.*, u.full_name as student_name
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            WHERE a.group_id = $1 AND a.subject_id = $2 AND a.date = $3
            ORDER BY u.full_name ASC
        `;
        
        const result = await pool.query(query, [groupId, subjectId, date]);
        
        return result.rows.map(row => new AttendanceModel(
            row.id, row.student_id, row.teacher_id, row.group_id, row.subject_id, 
            row.date, row.status, row.created_at, row.updated_at, row.student_name
        ));
    }

    async getByStudentId(studentId) {
        const query = `
            SELECT a.*, s.name as subject_name, u.full_name as teacher_name
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            LEFT JOIN users u ON a.teacher_id = u.id
            WHERE a.student_id = $1
            ORDER BY a.date DESC
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows.map(row => new AttendanceModel(
            row.id, row.student_id, row.teacher_id, row.group_id, row.subject_id, 
            row.date, row.status, row.created_at, row.updated_at, 
            null, row.subject_name, row.teacher_name
        ));
    }

    async getByTeacherId(teacherId) {
        const query = `
            SELECT a.*, u.full_name as student_name, s.name as subject_name, g.name as group_name
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            JOIN subjects s ON a.subject_id = s.id
            JOIN groups g ON a.group_id = g.id
            WHERE a.teacher_id = $1
            ORDER BY a.date DESC, g.name ASC, u.full_name ASC
        `;
        const result = await pool.query(query, [teacherId]);
        return result.rows.map(row => new AttendanceModel(
            row.id, row.student_id, row.teacher_id, row.group_id, row.subject_id, 
            row.date, row.status, row.created_at, row.updated_at, 
            row.student_name, row.subject_name, null, row.group_name
        ));
    }
}
// app/api/repository/GroupRepository.js
import Group from "../models/GroupModel";
import pool from "../db/config";
import querys from "../db/querys";

export default class GroupRepository {

    async getAllGroups() {
        const result = await pool.query(querys.groups.getAllGroups);
        return result.rows.map((row) => {
            const group = new Group(row.id, row.name, row.academic_level_id, row.main_teacher_id, row.capacity, row.created_at, row.level_name, row.teacher_name);
            group.student_count = row.student_count;
            group.level_slug = row.level_slug;
            return group;
        });
    }

    async getGroupById(id) {
        const result = await pool.query(querys.groups.getGroupById, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new Group(row.id, row.name, row.academic_level_id, row.main_teacher_id, row.capacity, row.created_at, row.level_name, row.teacher_name);
    }

    async createGroup(groupData) {
        const { name, academic_level_id, main_teacher_id, capacity } = groupData;
        try {
            const result = await pool.query(querys.groups.createGroup, [name, academic_level_id, main_teacher_id, capacity]);
            const row = result.rows[0];
            return new Group(row.id, row.name, row.academic_level_id, row.main_teacher_id, row.capacity, row.created_at);
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'groups_pkey') {
                await pool.query(querys.groups.fixSequence);
                const result = await pool.query(querys.groups.createGroup, [name, academic_level_id, main_teacher_id, capacity]);
                const row = result.rows[0];
                return new Group(row.id, row.name, row.academic_level_id, row.main_teacher_id, row.capacity, row.created_at);
            }
            throw error;
        }
    }

    async updateGroup(id, groupData) {
        const { name, academic_level_id, main_teacher_id, capacity } = groupData;
        const result = await pool.query(querys.groups.updateGroup, [name, academic_level_id, main_teacher_id, capacity, id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Group(row.id, row.name, row.academic_level_id, row.main_teacher_id, row.capacity, row.created_at);
    }

    async deleteGroup(id) {
        try {
            const result = await pool.query(querys.groups.deleteGroup, [id]);
            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '23503') {
                if (error.table === 'grades' || (error.detail && error.detail.includes('grades'))) {
                    throw new Error("No se puede eliminar el grupo porque tiene calificaciones registradas. Elimine las calificaciones primero.");
                }
                throw new Error("No se puede eliminar el grupo porque tiene registros dependientes en el sistema.");
            }
            throw error;
        }
    }

    
    async getStudentsByGroupId(groupId) {
        const result = await pool.query(querys.groups.getStudentsByGroupId, [groupId]);
        return result.rows; 
    }

    async addStudentToGroup(studentId, groupId) {
        const result = await pool.query(querys.groups.addStudentToGroup, [studentId, groupId]);
        return result.rows[0];
    }

    async removeStudentFromGroup(studentId, groupId) {
        const result = await pool.query(querys.groups.removeStudentFromGroup, [studentId, groupId]);
        return result.rowCount > 0;
    }

    async getStudentCount(groupId) {
        const result = await pool.query(querys.groups.getStudentCount, [groupId]);
        return result.rows[0].count;
    }

    async bulkEnroll(groupId, studentIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const values = [];
            const placeholders = studentIds.map((id, i) => {
                const offset = i * 2;
                values.push(id, groupId);
                return `($${offset + 1}, $${offset + 2})`;
            }).join(", ");

            const query = `${querys.groups.bulkInsertBase} ${placeholders} ON CONFLICT (student_id, group_id) DO NOTHING`;
            await client.query(query, values);
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async transferStudents(groupId, studentIds) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            
            if (studentIds.length > 0) {
               
                await client.query(
                    querys.groups.transferStudentsDelete,
                    [studentIds, groupId]
                );
            }

        
            const values = [];
            const placeholders = studentIds.map((id, i) => {
                const offset = i * 2;
                values.push(id, groupId);
                return `($${offset + 1}, $${offset + 2})`;
            }).join(", ");

            if (studentIds.length > 0) {
                const query = `${querys.groups.bulkInsertBase} ${placeholders} ON CONFLICT (student_id, group_id) DO NOTHING`;
                await client.query(query, values);
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getAllStudentEnrollments() {
        const result = await pool.query(querys.groups.getAllStudentEnrollments);
        return result.rows;
    }

    async removeAllStudentsFromGroup(groupId) {
        const result = await pool.query(querys.groups.removeAllStudentsFromGroup, [groupId]);
        return result.rowCount;
    }
}

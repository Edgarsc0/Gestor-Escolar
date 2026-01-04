import pool from "../db/config";
import querys from "../db/querys";
import SubjectModel from "../models/SubjectModel";

export default class SubjectRepository {
    
    async getAll() {
        const result = await pool.query(querys.subjects.getAll);
        return result.rows.map(row => new SubjectModel(row.id, row.name, row.academic_level_id, row.description, row.created_at, row.academic_level_name));
    }

    async getById(id) {
        const result = await pool.query(querys.subjects.getById, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new SubjectModel(row.id, row.name, row.academic_level_id, row.description, row.created_at, row.academic_level_name);
    }

    async getByAcademicLevel(levelId) {
        const result = await pool.query(querys.subjects.getByAcademicLevel, [levelId]);
        return result.rows.map(row => new SubjectModel(row.id, row.name, row.academic_level_id, row.description, row.created_at, row.academic_level_name));
    }

    async create(data) {
        const { name, academic_level_id, description } = data;
        try {
            const result = await pool.query(querys.subjects.create, [name, academic_level_id, description]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'subjects_pkey') {
                await pool.query(querys.subjects.fixSequence);
                const result = await pool.query(querys.subjects.create, [name, academic_level_id, description]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async update(id, data) {
        const { name, academic_level_id, description } = data;
        const result = await pool.query(querys.subjects.update, [name, academic_level_id, description, id]);
        return result.rows[0];
    }

    async delete(id) {
        const usageResult = await pool.query(querys.subjects.checkUsage, [id]);
        const { grades_count, schedules_count } = usageResult.rows[0];
        
        if (grades_count > 0) {
            throw new Error("No se puede eliminar la materia porque tiene calificaciones registradas.");
        }
        if (schedules_count > 0) {
            throw new Error("No se puede eliminar la materia porque está asignada en horarios.");
        }

        const result = await pool.query(querys.subjects.delete, [id]);
        return result.rowCount > 0;
    }
}
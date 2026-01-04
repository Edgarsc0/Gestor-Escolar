// app/api/repository/AcademicLevelRepository.js
import AcademicLevel from "../models/AcademicLevelModel";
import pool from "../db/config";
import querys from "../db/querys";

export default class AcademicLevelRepository {
    async getAll() {
        const result = await pool.query(querys.academicLevels.getAll);
        return result.rows.map((row) => new AcademicLevel(row.id, row.name, row.slug));
    }
}

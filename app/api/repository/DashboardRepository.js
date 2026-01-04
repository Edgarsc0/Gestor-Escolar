import pool from "../db/config";
import querys from "../db/querys";

export default class DashboardRepository {
    async getStats() {
        const result = await pool.query(querys.dashboard.getStats);
        return result.rows[0];
    }
}
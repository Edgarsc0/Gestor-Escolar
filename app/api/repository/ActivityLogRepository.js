import pool from "../db/config";
import querys from "../db/querys";

export default class ActivityLogRepository {
    async create(userId, action) {
        // We don't wait for this to complete to avoid blocking the main operation
        pool.query(querys.activityLogs.create, [userId, action]).catch(console.error);
    }

    async getRecent() {
        const result = await pool.query(querys.activityLogs.getRecent);
        return result.rows;
    }
}
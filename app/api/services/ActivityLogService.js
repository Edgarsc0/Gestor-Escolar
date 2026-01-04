import ActivityLogRepository from "../repository/ActivityLogRepository";

export default class ActivityLogService {
    constructor() {
        this.repository = new ActivityLogRepository();
    }

    logActivity(userId, action) {
        this.repository.create(userId, action);
    }

    async getRecentActivities() {
        return await this.repository.getRecent();
    }
}
import DashboardRepository from "../repository/DashboardRepository";

export default class DashboardService {
    constructor() {
        this.repository = new DashboardRepository();
    }

    async getStats() {
        return await this.repository.getStats();
    }
}
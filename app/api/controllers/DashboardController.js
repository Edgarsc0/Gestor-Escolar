import { NextResponse } from "next/server";
import DashboardService from "../services/DashboardService";
import ActivityLogService from "../services/ActivityLogService";

export default class DashboardController {
    constructor() {
        this.service = new DashboardService();
        this.logService = new ActivityLogService();
    }

    getStats = async (req) => {
        try {
            const stats = await this.service.getStats();
            return NextResponse.json(stats);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getRecentActivity = async (req) => {
        try {
            const logs = await this.logService.getRecentActivities();
            return NextResponse.json(logs);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
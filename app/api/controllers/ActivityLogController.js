import { NextResponse } from "next/server";
import ActivityLogService from "../services/ActivityLogService";

export default class ActivityLogController {
    constructor() {
        this.service = new ActivityLogService();
    }

    getRecent = async (req) => {
        try {
            const logs = await this.service.getRecentActivities();
            return NextResponse.json(logs);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
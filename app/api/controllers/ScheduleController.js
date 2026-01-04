import { NextResponse } from "next/server";
import ScheduleService from "../services/ScheduleService";
import { jwtVerify } from "jose";

const getUserId = async (req) => {
    const token = req.cookies.get('session_token');
    if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        try {
            const { payload } = await jwtVerify(token.value, secret);
            return payload.id;
        } catch {}
    }
    return null;
};

export default class ScheduleController {
    constructor() {
        this.service = new ScheduleService();
    }

    getByGroup = async (req, { params }) => {
        try {
            const { id } = await params;
            const schedules = await this.service.getSchedulesByGroup(id);
            return NextResponse.json(schedules);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    create = async (req) => {
        try {
            const body = await req.json();
            const adminId = await getUserId(req);
            const schedule = await this.service.createSchedule(body, adminId);
            return NextResponse.json(schedule, { status: 201 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    update = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const adminId = await getUserId(req);
            const schedule = await this.service.updateSchedule(id, body, adminId);
            return NextResponse.json(schedule);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    delete = async (req, { params }) => {
        try {
            const { id } = await params;
            const adminId = await getUserId(req);
            await this.service.deleteSchedule(id, adminId);
            return NextResponse.json({ message: "Schedule deleted" });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    deleteByGroup = async (req, { params }) => {
        try {
            const { id } = await params;
            const adminId = await getUserId(req);
            await this.service.deleteByGroupId(id, adminId);
            return NextResponse.json({ message: "Schedules deleted" });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    deleteByGroupAndDay = async (req, { params }) => {
        try {
            const { id, day } = await params;
            const adminId = await getUserId(req);
            await this.service.deleteByGroupIdAndDay(id, day, adminId);
            return NextResponse.json({ message: "Schedules deleted" });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    getStudentSchedule = async (req, { params }) => {
        try {
            const { id } = await params;
            const schedule = await this.service.getStudentSchedule(id);
            return NextResponse.json(schedule);
        } catch (error) {
            console.error("Error fetching student schedule:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
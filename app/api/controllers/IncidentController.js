import { NextResponse } from "next/server";
import IncidentService from "../services/IncidentService";

export default class IncidentController {
    constructor() {
        this.service = new IncidentService();
    }

    create = async (req) => {
        try {
            const body = await req.json();
            const incident = await this.service.createIncident(body);
            return NextResponse.json(incident, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    };

    getAll = async (req) => {
        try {
            const { searchParams } = new URL(req.url);
            const studentId = searchParams.get('student_id');
            const reporterId = searchParams.get('reporter_id');
            
            let incidents;
            if (studentId) incidents = await this.service.getIncidentsByStudent(studentId);
            else if (reporterId) incidents = await this.service.getIncidentsByReporter(reporterId);
            else incidents = await this.service.getAllIncidents();
            
            return NextResponse.json(incidents);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    updateStatus = async (req, { params }) => {
        try {
            const { id } = await params;
            const { status } = await req.json();
            if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 });
            const updatedIncident = await this.service.updateIncidentStatus(id, status);
            return NextResponse.json(updatedIncident);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
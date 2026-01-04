import { NextResponse } from "next/server";
import JustificationService from "../services/JustificationService";

export default class JustificationController {
    constructor() {
        this.service = new JustificationService();
    }

    create = async (req) => {
        try {
            const body = await req.json();
            const justification = await this.service.createJustification(body);
            return NextResponse.json(justification, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    };

    getByIncident = async (req, { params }) => {
        try {
            const { incidentId } = await params;
            const justification = await this.service.getJustificationByIncident(incidentId);
            if (!justification) return NextResponse.json({ error: "Justification not found" }, { status: 404 });
            return NextResponse.json(justification);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    review = async (req, { params }) => {
        try {
            const { id } = await params; // Justification ID
            const body = await req.json();
            const reviewedJustification = await this.service.reviewJustification(id, body);
            return NextResponse.json(reviewedJustification);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    };

    getPending = async (req) => {
        try {
            const justifications = await this.service.getPendingJustifications();
            return NextResponse.json(justifications);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
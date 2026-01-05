import { NextResponse } from "next/server";
import EmergencyContactService from "../services/EmergencyContactService";

export default class EmergencyContactController {
    constructor() {
        this.service = new EmergencyContactService();
    }

    create = async (req) => {
        try {
            const body = await req.json();
            const contact = await this.service.createContact(body);
            return NextResponse.json(contact, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    };

    getByUser = async (req, { params }) => {
        try {
            const { userId } = await params;
            const contacts = await this.service.getContactsByUser(userId);
            return NextResponse.json(contacts);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    update = async (req, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();
            const updated = await this.service.updateContact(id, body);
            return NextResponse.json(updated);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    delete = async (req, { params }) => {
        try {
            const { id } = await params;
            await this.service.deleteContact(id);
            return NextResponse.json({ message: "Contact deleted" });
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
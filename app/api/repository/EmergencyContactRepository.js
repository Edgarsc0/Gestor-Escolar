import pool from "../db/config";
import querys from "../db/querys";
import EmergencyContactModel from "../models/EmergencyContactModel";

export default class EmergencyContactRepository {
    async create(data) {
        const { user_id, contact_name, relationship, phone_number } = data;
        try {
            const result = await pool.query(querys.emergencyContacts.create, [user_id, contact_name, relationship, phone_number]);
            const row = result.rows[0];
            return new EmergencyContactModel(row.id, row.user_id, row.contact_name, row.relationship, row.phone_number, row.created_at);
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'emergency_contacts_pkey') {
                await pool.query(querys.emergencyContacts.fixSequence);
                const result = await pool.query(querys.emergencyContacts.create, [user_id, contact_name, relationship, phone_number]);
                const row = result.rows[0];
                return new EmergencyContactModel(row.id, row.user_id, row.contact_name, row.relationship, row.phone_number, row.created_at);
            }
            throw error;
        }
    }

    async getByUserId(userId) {
        const result = await pool.query(querys.emergencyContacts.getByUserId, [userId]);
        return result.rows.map(row => new EmergencyContactModel(row.id, row.user_id, row.contact_name, row.relationship, row.phone_number, row.created_at));
    }

    async update(id, data) {
        const { contact_name, relationship, phone_number } = data;
        const result = await pool.query(querys.emergencyContacts.update, [contact_name, relationship, phone_number, id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new EmergencyContactModel(row.id, row.user_id, row.contact_name, row.relationship, row.phone_number, row.created_at);
    }

    async delete(id) {
        const result = await pool.query(querys.emergencyContacts.delete, [id]);
        return result.rowCount > 0;
    }
}
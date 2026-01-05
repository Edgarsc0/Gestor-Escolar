import EmergencyContactRepository from "../repository/EmergencyContactRepository";

export default class EmergencyContactService {
    constructor() {
        this.repository = new EmergencyContactRepository();
    }

    async createContact(data) {
        if (!data.user_id || !data.contact_name || !data.phone_number) {
            throw new Error("User ID, contact name, and phone number are required.");
        }
        return await this.repository.create(data);
    }

    async getContactsByUser(userId) {
        return await this.repository.getByUserId(userId);
    }

    async updateContact(id, data) {
        return await this.repository.update(id, data);
    }

    async deleteContact(id) {
        return await this.repository.delete(id);
    }
}
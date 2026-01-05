export default class EmergencyContactModel {
    constructor(id, user_id, contact_name, relationship, phone_number, created_at) {
        this.id = id;
        this.user_id = user_id;
        this.contact_name = contact_name;
        this.relationship = relationship;
        this.phone_number = phone_number;
        this.created_at = created_at;
    }
}
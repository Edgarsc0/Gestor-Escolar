export default class PersonalInfoModel {
    constructor(id, user_id, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, created_at, updated_at) {
        this.id = id;
        this.user_id = user_id;
        this.personal_email = personal_email;
        this.cell_phone = cell_phone;
        this.additional_phone = additional_phone;
        this.street_address = street_address;
        this.neighborhood = neighborhood;
        this.postal_code = postal_code;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
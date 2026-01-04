import PersonalInfoRepository from "../repository/PersonalInfoRepository";

export default class PersonalInfoService {
    constructor() {
        this.repository = new PersonalInfoRepository();
    }

    async getPersonalInfo(userId) {
        return await this.repository.getByUserId(userId);
    }

    async updatePersonalInfo(userId, data) {
        
        let updated = await this.repository.update(userId, data);
        
        
        if (!updated) {
        
            if (!data.personal_email) throw new Error("El correo personal es requerido.");
            updated = await this.repository.create({ ...data, user_id: userId });
        }
        
        return updated;
    }
}
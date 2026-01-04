import PersonalInfoRepository from "../repository/PersonalInfoRepository";

export default class PersonalInfoService {
    constructor() {
        this.repository = new PersonalInfoRepository();
    }

    async getPersonalInfo(userId) {
        return await this.repository.getByUserId(userId);
    }

    async updatePersonalInfo(userId, data) {
        // Intentamos actualizar primero
        let updated = await this.repository.update(userId, data);
        
        // Si no se actualizó nada (no existe el registro), lo creamos
        if (!updated) {
            // Aseguramos que el user_id esté en los datos y validamos el email
            if (!data.personal_email) throw new Error("El correo personal es requerido.");
            updated = await this.repository.create({ ...data, user_id: userId });
        }
        
        return updated;
    }
}
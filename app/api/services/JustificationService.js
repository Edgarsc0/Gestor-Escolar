import JustificationRepository from "../repository/JustificationRepository";
import IncidentRepository from "../repository/IncidentRepository";
import ActivityLogService from "./ActivityLogService";

export default class JustificationService {
    constructor() {
        this.repository = new JustificationRepository();
        this.incidentRepository = new IncidentRepository();
        this.logService = new ActivityLogService();
    }

    async createJustification(data) {
        if (!data.incident_id || !data.tutor_id || !data.reason) {
            throw new Error("Incident, tutor, and reason are required.");
        }

        const newJustification = await this.repository.create(data);
        await this.incidentRepository.updateStatus(data.incident_id, 'Esperando Revisión');
        this.logService.logActivity(data.tutor_id, `Envió una justificación para la incidencia #${data.incident_id}.`);

        return newJustification;
    }

    async getJustificationByIncident(incidentId) {
        return await this.repository.getByIncidentId(incidentId);
    }

    async reviewJustification(justificationId, reviewData) {
        const { admin_comment, reviewed_by, approved } = reviewData;
        if (approved === undefined || !reviewed_by) {
            throw new Error("Approval status and reviewer ID are required.");
        }
        const updatedJustification = await this.repository.update(justificationId, { admin_comment, reviewed_by });
        const newStatus = approved ? 'Justificada' : 'Rechazada';
        const action = approved ? 'aprobó' : 'rechazó';
        this.logService.logActivity(reviewed_by, `Revisó y ${action} la justificación para la incidencia #${updatedJustification.incident_id}.`);
        await this.incidentRepository.updateStatus(updatedJustification.incident_id, newStatus);
        return updatedJustification;
    }

    async getPendingJustifications() {
        return await this.repository.getAllPending();
    }
}
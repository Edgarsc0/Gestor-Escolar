export default class ActivityLogModel {
    constructor(id, user_id, action, created_at, user_name) {
        this.id = id;
        this.user_id = user_id;
        this.action = action;
        this.created_at = created_at;
        this.user_name = user_name;
    }
}
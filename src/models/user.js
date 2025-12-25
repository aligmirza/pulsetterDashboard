export default class User {
  constructor({
    id,
    email,
    role,
    client_id: clientId,
    created_at: createdAt,
    updated_at: updatedAt,
  }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.clientId = clientId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default class Client {
  constructor({
    id,
    name,
    contact_email: contactEmail,
    contact_name: contactName,
    created_at: createdAt,
    updated_at: updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.contactEmail = contactEmail;
    this.contactName = contactName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export default class Campaign {
  constructor({
    id,
    provider,
    external_id: externalId,
    name,
    status,
    schedule,
    client_id: clientId,
    evergreen,
    created_at: createdAt,
    updated_at: updatedAt,
  }) {
    this.id = id;
    this.provider = provider;
    this.externalId = externalId;
    this.name = name;
    this.status = status;
    this.schedule = schedule;
    this.clientId = clientId;
    this.evergreen = evergreen;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

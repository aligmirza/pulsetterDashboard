export default class Lead {
  constructor({
    id,
    first_name: firstName,
    last_name: lastName,
    email,
    domain,
    company_name: companyName,
    job_title: jobTitle,
    location,
    linkedin_url: linkedinUrl,
    enrichment_data: enrichmentData,
    client_id: clientId,
    created_at: createdAt,
    updated_at: updatedAt,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.domain = domain;
    this.companyName = companyName;
    this.jobTitle = jobTitle;
    this.location = location;
    this.linkedinUrl = linkedinUrl;
    this.enrichmentData = enrichmentData;
    this.clientId = clientId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

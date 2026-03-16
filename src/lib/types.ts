export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
}

export interface LeadSubmission extends LeadFormData {
  tags: string[];
  source?: string;
}

export interface GHLContactPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  locationId: string;
  tags?: string[];
  source?: string;
}

export interface GHLResponse {
  success: boolean;
  contactId?: string;
  isDuplicate?: boolean;
  error?: string;
  statusCode?: number;
}

export interface APIResponse {
  success: boolean;
  message: string;
  contactId?: string;
}

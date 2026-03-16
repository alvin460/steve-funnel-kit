import type { LeadFormData } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // optional field
  return PHONE_REGEX.test(phone.trim());
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>"'&\\]/g, '');
}

export function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = sanitizeString(fullName).split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  return { firstName, lastName };
}

export function validateLeadForm(data: unknown): {
  valid: boolean;
  errors: Record<string, string>;
  data?: LeadFormData;
} {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Invalid form data' } };
  }

  const formData = data as Record<string, unknown>;

  // Name
  if (!formData.name || typeof formData.name !== 'string' || formData.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (formData.name.length > 100) {
    errors.name = 'Name is too long';
  }

  // Email
  if (!formData.email || typeof formData.email !== 'string' || formData.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (formData.email.length > 254) {
    errors.email = 'Email is too long';
  } else if (!validateEmail(formData.email as string)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone (optional)
  if (formData.phone && typeof formData.phone === 'string') {
    if (formData.phone.length > 20) {
      errors.phone = 'Phone number is too long';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      name: sanitizeString(formData.name as string),
      email: (formData.email as string).trim().toLowerCase(),
      phone: formData.phone ? sanitizeString(formData.phone as string) : undefined,
    },
  };
}

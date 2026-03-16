import type { GHLContactPayload, GHLResponse } from './types';

const GHL_API_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders(apiKey: string): Record<string, string> {
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': GHL_API_VERSION,
  };
}

export async function upsertContact(
  payload: GHLContactPayload,
  apiKey: string
): Promise<GHLResponse> {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/upsert`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(payload),
    });

    const data = await response.json() as Record<string, unknown>;

    // Success
    if (response.ok) {
      const contact = data.contact as Record<string, unknown> | undefined;
      return {
        success: true,
        contactId: contact?.id as string | undefined,
        isDuplicate: false,
      };
    }

    // Duplicate contact handling (GHL returns 400, 409, or 422 for duplicates)
    if (response.status === 400 || response.status === 409 || response.status === 422) {
      const message = (data.message as string) || '';
      const meta = data.meta as Record<string, unknown> | undefined;
      const contactId = (meta?.contactId ?? meta?.id) as string | undefined;

      if (message.toLowerCase().includes('duplicate') || contactId) {
        return {
          success: true,
          contactId: contactId,
          isDuplicate: true,
        };
      }
    }

    // Other error
    return {
      success: false,
      error: (data.message as string) || `GHL API error: ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Network error: ${message}`,
    };
  }
}

import { createHmac, randomBytes } from 'node:crypto';

import { getMenteDentaEnv } from './env';

const TOKEN_BYTES = 32;

export function generatePanelToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashPanelToken(token: string): string {
  if (token.trim() === '') {
    throw new Error('Panel token cannot be empty');
  }

  return createHmac('sha256', getMenteDentaEnv().MENTEDENTA_TOKEN_PEPPER)
    .update(token, 'utf8')
    .digest('hex');
}

export function generatePanelUrl(token: string): string {
  if (token.trim() === '') {
    throw new Error('Panel token cannot be empty');
  }

  const panelUrl = new URL(getMenteDentaEnv().MENTEDENTA_PANEL_BASE_URL);
  panelUrl.searchParams.set('token', token);
  return panelUrl.toString();
}

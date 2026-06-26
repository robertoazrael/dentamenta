export interface MenteDentaEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MENTEDENTA_WEBHOOK_URL: string;
  MENTEDENTA_PANEL_BASE_URL: string;
  MENTEDENTA_TOKEN_PEPPER: string;
}

const REQUIRED_ENV_NAMES = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MENTEDENTA_WEBHOOK_URL',
  'MENTEDENTA_PANEL_BASE_URL',
  'MENTEDENTA_TOKEN_PEPPER',
] as const;

let cachedEnv: MenteDentaEnv | undefined;
let cachedInternalApiKey: string | undefined;

function readRequiredEnv(name: (typeof REQUIRED_ENV_NAMES)[number]): string {
  const value = import.meta.env[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required server-side environment variable: ${name}`);
  }

  return value.trim();
}

function validateUrl(name: 'SUPABASE_URL' | 'MENTEDENTA_WEBHOOK_URL' | 'MENTEDENTA_PANEL_BASE_URL', value: string): void {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('unsupported protocol');
    }
  } catch {
    throw new Error(`Invalid URL in server-side environment variable: ${name}`);
  }
}

export function getMenteDentaEnv(): MenteDentaEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const env = Object.fromEntries(
    REQUIRED_ENV_NAMES.map((name) => [name, readRequiredEnv(name)]),
  ) as unknown as MenteDentaEnv;

  validateUrl('SUPABASE_URL', env.SUPABASE_URL);
  validateUrl('MENTEDENTA_WEBHOOK_URL', env.MENTEDENTA_WEBHOOK_URL);
  validateUrl('MENTEDENTA_PANEL_BASE_URL', env.MENTEDENTA_PANEL_BASE_URL);

  cachedEnv = env;
  return env;
}

export function getMenteDentaInternalApiKey(): string {
  if (cachedInternalApiKey) {
    return cachedInternalApiKey;
  }

  const value = import.meta.env.MENTEDENTA_INTERNAL_API_KEY;

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Missing required server-side environment variable: MENTEDENTA_INTERNAL_API_KEY');
  }

  cachedInternalApiKey = value.trim();
  return cachedInternalApiKey;
}

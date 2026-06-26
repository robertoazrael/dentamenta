export interface MenteDentaSanitizationMetadata {
  sanitized: boolean;
  hidden: {
    email: boolean;
    phone: boolean;
    sensitive_number: boolean;
    identifier: boolean;
    offensive_language: boolean;
  };
}

export interface MenteDentaSanitizedText {
  content: string;
  metadata: MenteDentaSanitizationMetadata;
}

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BANK_CARD_PATTERN = /\b(?:\d[ -]?){13,19}\b/g;
const RFC_CURP_PATTERN = /\b(?:[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}|[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)\b/gi;
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}/g;
const OFFENSIVE_LANGUAGE_PATTERN = /\b(?:pendej[oa]s?|put[oa]s?|cabron(?:es)?|cabrones|cabr[oó]n(?:es)?|chingad[ao]s?|chingar|chingas?|chinga(?:do|da)?|mierda|culer[oa]s?|assholes?|fuck(?:ing|er|ers)?|shit|bitch(?:es)?|bastards?|cunts?|motherfuckers?)\b/gi;

function isProbablePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  if (digits.length < 8 || digits.length > 15) {
    return false;
  }

  return !/^(\d)\1+$/.test(digits);
}

function isProbableBankCard(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  return !/^(\d)\1+$/.test(digits);
}

export function sanitizeMenteDentaText(text: string): MenteDentaSanitizedText {
  const hidden: MenteDentaSanitizationMetadata['hidden'] = {
    email: false,
    phone: false,
    sensitive_number: false,
    identifier: false,
    offensive_language: false,
  };

  let content = text;

  content = content.replace(EMAIL_PATTERN, () => {
    hidden.email = true;
    return '[correo oculto]';
  });

  content = content.replace(BANK_CARD_PATTERN, (match) => {
    if (!isProbableBankCard(match)) {
      return match;
    }

    hidden.sensitive_number = true;
    return '[número sensible oculto]';
  });

  content = content.replace(RFC_CURP_PATTERN, () => {
    hidden.identifier = true;
    return '[identificador oculto]';
  });

  content = content.replace(PHONE_PATTERN, (match) => {
    if (!isProbablePhone(match)) {
      return match;
    }

    hidden.phone = true;
    return '[teléfono oculto]';
  });

  content = content.replace(OFFENSIVE_LANGUAGE_PATTERN, () => {
    hidden.offensive_language = true;
    return '[lenguaje ofensivo oculto]';
  });

  const sanitized = Object.values(hidden).some(Boolean);

  return {
    content,
    metadata: {
      sanitized,
      hidden,
    },
  };
}

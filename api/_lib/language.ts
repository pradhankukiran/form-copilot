import type { SupportedLanguage } from '../../src/shared/assistant-contract';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi'
};

export function getLanguageLabel(language: SupportedLanguage): string {
  return LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS.en;
}

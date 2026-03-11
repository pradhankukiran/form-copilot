import type { SupportedLanguage } from '../../shared/assistant-contract';

export type { SupportedLanguage };

export interface AssistantExplanation {
  whatThisMeans: string;
  whyAsked: string;
  whatToEnter: string;
  examples: string[];
  commonMistakes: string[];
  disclaimer?: string;
}

export interface AssistantChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pending?: boolean;
  error?: boolean;
}

export interface AssistantUiError {
  code: 'NETWORK' | 'SERVER' | 'VALIDATION';
  message: string;
  retryable: boolean;
}

export interface AssistantFieldState {
  explanationStatus: 'idle' | 'loading' | 'ready' | 'error';
  explanation: AssistantExplanation | null;
  chatTurns: AssistantChatTurn[];
  chatPending: boolean;
  error: AssistantUiError | null;
}

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export interface SummaryRow {
  label: string;
  value: string;
}

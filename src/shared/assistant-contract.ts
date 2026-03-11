export type SupportedLanguage = 'en' | 'es' | 'fr' | 'hi';

export type AssistantFieldType =
  | 'text'
  | 'select'
  | 'currency'
  | 'date'
  | 'textarea'
  | 'boolean';

export interface AssistantFieldContext {
  fieldId: string;
  fieldLabel: string;
  fieldType: AssistantFieldType;
  questionText: string;
  helpText?: string | null;
  placeholder?: string | null;
  allowedOptions?: string[];
  sampleAnswer?: string | null;
}

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantExplainRequest extends AssistantFieldContext {
  language: SupportedLanguage;
}

export interface AssistantChatRequest extends AssistantExplainRequest {
  chatHistory: AssistantChatMessage[];
  userMessage: string;
}

export interface AssistantExplanation {
  whatThisMeans: string;
  whyAsked: string;
  whatToEnter: string;
  examples: string[];
  commonMistakes: string[];
  disclaimer?: string;
}

export interface AssistantResponseMeta {
  provider: 'anthropic' | 'groq';
  model: string;
  language: SupportedLanguage;
}

export interface AssistantExplainResponse {
  explanation: AssistantExplanation;
  meta: AssistantResponseMeta;
}

export interface AssistantChatResponse {
  reply: string;
  meta: AssistantResponseMeta;
}

export type AssistantApiErrorCode =
  | 'BAD_REQUEST'
  | 'METHOD_NOT_ALLOWED'
  | 'INVALID_RESPONSE'
  | 'PROVIDER'
  | 'UNAUTHORIZED';

export interface AssistantApiErrorBody {
  code: AssistantApiErrorCode;
  message: string;
  retryable: boolean;
  details?: string[];
}

export interface AssistantApiErrorResponse {
  error: AssistantApiErrorBody;
}

export interface HealthResponse {
  ok: true;
  provider: 'anthropic' | 'groq';
  model: string;
  timestamp: string;
}

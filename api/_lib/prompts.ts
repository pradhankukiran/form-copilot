import type {
  AssistantChatRequest,
  AssistantExplainRequest
} from '../../src/shared/assistant-contract';
import { getLanguageLabel } from './language';

function renderFieldContext(request: AssistantExplainRequest): string {
  return [
    `Field label: ${request.fieldLabel}`,
    `Field type: ${request.fieldType}`,
    `Question text: ${request.questionText}`,
    request.helpText ? `Help text: ${request.helpText}` : null,
    request.placeholder ? `Placeholder: ${request.placeholder}` : null,
    request.allowedOptions && request.allowedOptions.length > 0
      ? `Allowed options: ${request.allowedOptions.join(', ')}`
      : null,
    request.sampleAnswer ? `Sample answer: ${request.sampleAnswer}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildExplainPrompt(request: AssistantExplainRequest): {
  system: string;
  user: string;
} {
  const languageLabel = getLanguageLabel(request.language);

  return {
    system: [
      'You are a neutral enterprise form assistant.',
      'You explain one field at a time and never answer unrelated questions.',
      'Do not provide legal, licensing, code compliance, approval, or validation advice.',
      'Do not suggest auto-filling or approving the answer.',
      'Follow the response schema exactly.',
      'Use plain language and a professional tone.'
    ].join(' '),
    user: [
      `Respond in ${languageLabel}.`,
      'Explain only the following field.',
      renderFieldContext(request),
      'Provide concise content for each section in the schema.',
      'Set disclaimer to a short reminder that this assistant does not provide legal or compliance advice.'
    ].join('\n\n')
  };
}

export function buildExplainRepairPrompt(rawContent: string): { system: string; user: string } {
  return {
    system:
      'You repair malformed JSON. Return JSON only. Do not add markdown, commentary, or extra keys.',
    user: [
      'Rewrite the following content into valid JSON with exactly these keys:',
      'whatThisMeans, whyAsked, whatToEnter, examples, commonMistakes, disclaimer',
      'examples and commonMistakes must be arrays of strings.',
      rawContent
    ].join('\n\n')
  };
}

export function buildChatSystemPrompt(request: AssistantChatRequest): string {
  const languageLabel = getLanguageLabel(request.language);

  return [
    'You are a neutral enterprise field assistant.',
    'Stay scoped to the current field only.',
    'If the user asks about anything outside this field, politely redirect them back to the field.',
    'Do not provide legal, licensing, code compliance, approval, or validation advice.',
    'Do not offer to fill the form or judge whether the answer is acceptable.',
    `Respond in ${languageLabel}.`,
    'Keep the answer concise and professional.',
    '',
    'Current field context:',
    renderFieldContext(request)
  ].join('\n');
}

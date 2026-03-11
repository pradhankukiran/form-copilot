import { z } from 'zod';

import type {
  AssistantChatRequest,
  AssistantExplainRequest,
  AssistantExplanation
} from '../../src/shared/assistant-contract';

export const supportedLanguageSchema = z.enum(['en', 'es', 'fr', 'hi']);

const baseFieldContextSchema = z.object({
  fieldId: z.string().trim().min(1),
  fieldLabel: z.string().trim().min(1),
  fieldType: z.enum(['text', 'select', 'currency', 'date', 'textarea', 'boolean']),
  questionText: z.string().trim().min(1),
  helpText: z.string().trim().min(1).nullable().optional(),
  placeholder: z.string().trim().min(1).nullable().optional(),
  allowedOptions: z.array(z.string().trim().min(1)).max(12).optional().default([]),
  sampleAnswer: z.string().trim().min(1).nullable().optional()
});

export const explainRequestSchema = baseFieldContextSchema.extend({
  language: supportedLanguageSchema
}) satisfies z.ZodType<AssistantExplainRequest>;

export const chatRequestSchema = baseFieldContextSchema.extend({
  language: supportedLanguageSchema,
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1200)
      })
    )
    .max(12),
  userMessage: z.string().trim().min(1).max(1200)
}) satisfies z.ZodType<AssistantChatRequest>;

export const explanationSchema = z.object({
  whatThisMeans: z.string().trim().min(1),
  whyAsked: z.string().trim().min(1),
  whatToEnter: z.string().trim().min(1),
  examples: z.array(z.string().trim().min(1)).max(6),
  commonMistakes: z.array(z.string().trim().min(1)).max(6),
  disclaimer: z.string().trim().min(1).optional()
}) satisfies z.ZodType<AssistantExplanation>;

export const explanationJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['whatThisMeans', 'whyAsked', 'whatToEnter', 'examples', 'commonMistakes'],
  properties: {
    whatThisMeans: {
      type: 'string'
    },
    whyAsked: {
      type: 'string'
    },
    whatToEnter: {
      type: 'string'
    },
    examples: {
      type: 'array',
      items: { type: 'string' }
    },
    commonMistakes: {
      type: 'array',
      items: { type: 'string' }
    },
    disclaimer: { type: 'string' }
  }
} as const;

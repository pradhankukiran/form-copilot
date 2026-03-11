import { Injectable, signal } from '@angular/core';

import type {
  AssistantChatTurn,
  AssistantExplanation,
  AssistantFieldState,
  AssistantUiError,
  SupportedLanguage
} from '../models/assistant-ui';

const createInitialState = (): AssistantFieldState => ({
  explanationStatus: 'idle',
  explanation: null,
  chatTurns: [],
  chatPending: false,
  error: null
});

@Injectable({
  providedIn: 'root'
})
export class AssistantSessionStore {
  private readonly states = signal<Record<string, AssistantFieldState>>({});

  read(fieldId: string, language: SupportedLanguage): AssistantFieldState {
    return this.states()[this.key(fieldId, language)] ?? createInitialState();
  }

  setExplanationLoading(fieldId: string, language: SupportedLanguage): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      explanationStatus: 'loading',
      error: null
    }));
  }

  setExplanation(fieldId: string, language: SupportedLanguage, explanation: AssistantExplanation): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      explanation,
      explanationStatus: 'ready',
      error: null
    }));
  }

  setExplanationError(fieldId: string, language: SupportedLanguage, error: AssistantUiError): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      explanationStatus: 'error',
      error
    }));
  }

  appendChatTurn(fieldId: string, language: SupportedLanguage, turn: AssistantChatTurn): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      chatTurns: [...state.chatTurns, turn],
      error: null
    }));
  }

  updateChatTurn(
    fieldId: string,
    language: SupportedLanguage,
    turnId: string,
    updater: (turn: AssistantChatTurn) => AssistantChatTurn
  ): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      chatTurns: state.chatTurns.map((turn) => (turn.id === turnId ? updater(turn) : turn))
    }));
  }

  removeChatTurn(fieldId: string, language: SupportedLanguage, turnId: string): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      chatTurns: state.chatTurns.filter((turn) => turn.id !== turnId)
    }));
  }

  setChatPending(fieldId: string, language: SupportedLanguage, chatPending: boolean): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      chatPending
    }));
  }

  setError(fieldId: string, language: SupportedLanguage, error: AssistantUiError | null): void {
    this.update(fieldId, language, (state) => ({
      ...state,
      error
    }));
  }

  private update(
    fieldId: string,
    language: SupportedLanguage,
    updater: (state: AssistantFieldState) => AssistantFieldState
  ): void {
    const key = this.key(fieldId, language);

    this.states.update((current) => ({
      ...current,
      [key]: updater(current[key] ?? createInitialState())
    }));
  }

  private key(fieldId: string, language: SupportedLanguage): string {
    return `${fieldId}::${language}`;
  }
}

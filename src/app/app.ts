import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { FieldAssistantPanelComponent } from './components/field-assistant-panel/field-assistant-panel.component';
import { SAMPLE_PERMIT_FIELDS, SAMPLE_PERMIT_SECTIONS } from './data/sample-permit-fields';
import type { AssistantChatTurn, AssistantFieldState, SupportedLanguage } from './models/assistant-ui';
import type { PermitFieldDefinition, PermitFormSection } from './models/form-models';
import { AssistantService } from './services/assistant.service';
import { AssistantSessionStore } from './services/assistant-session.store';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FieldAssistantPanelComponent,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly assistantService = inject(AssistantService);
  protected readonly assistantSession = inject(AssistantSessionStore);

  protected readonly fields = signal(SAMPLE_PERMIT_FIELDS);
  protected readonly sections = SAMPLE_PERMIT_SECTIONS;
  protected readonly selectedLanguage = signal<SupportedLanguage>('en');
  protected readonly panelVisible = signal(false);
  protected readonly activeFieldId = signal<string | null>(null);

  protected readonly form = new FormGroup({
    parcelNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    structureType: new FormControl<string | null>(null, Validators.required),
    contractPrice: new FormControl<number | null>(null, Validators.required),
    targetCompletionDate: new FormControl('', { nonNullable: true }),
    workDescription: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ownerOccupied: new FormControl(false, { nonNullable: true })
  });

  protected readonly activeField = computed<PermitFieldDefinition | null>(() => {
    const currentId = this.activeFieldId();
    return this.fields().find((field) => field.id === currentId) ?? null;
  });

  protected readonly activeFieldState = computed<AssistantFieldState | null>(() => {
    const field = this.activeField();
    return field ? this.assistantSession.read(field.id, this.selectedLanguage()) : null;
  });

  protected fieldsBySection(sectionId: PermitFormSection['id']): PermitFieldDefinition[] {
    return this.fields().filter((field) => field.sectionId === sectionId);
  }

  protected sectionFieldCount(sectionId: PermitFormSection['id']): number {
    return this.fieldsBySection(sectionId).length;
  }

  protected async openAssistant(field: PermitFieldDefinition): Promise<void> {
    this.activeFieldId.set(field.id);
    this.panelVisible.set(true);
    await this.ensureExplanation(field, this.selectedLanguage());
  }

  protected async retryActiveExplanation(): Promise<void> {
    const field = this.activeField();
    if (!field) {
      return;
    }

    await this.ensureExplanation(field, this.selectedLanguage(), true);
  }

  protected async submitFollowUp(message: string): Promise<void> {
    const field = this.activeField();
    if (!field) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const language = this.selectedLanguage();
    const chatHistory = this.assistantSession
      .read(field.id, language)
      .chatTurns.filter((turn) => !turn.pending && !turn.error);
    const userTurn: AssistantChatTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    };
    const pendingAssistantId = crypto.randomUUID();

    this.assistantSession.appendChatTurn(field.id, language, userTurn);
    this.assistantSession.appendChatTurn(field.id, language, {
      id: pendingAssistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      pending: true
    });
    this.assistantSession.setChatPending(field.id, language, true);

    try {
      const response = await firstValueFrom(this.assistantService.sendFollowUp(field, language, chatHistory, trimmed));

      this.assistantSession.updateChatTurn(field.id, language, pendingAssistantId, (turn) => ({
        ...turn,
        content: response.reply,
        timestamp: new Date().toISOString(),
        pending: false
      }));
      this.assistantSession.setChatPending(field.id, language, false);
      this.assistantSession.setError(field.id, language, null);
    } catch (error) {
      const uiError = this.assistantService.toUiError(error, 'The assistant could not answer that follow-up question.');

      this.assistantSession.updateChatTurn(field.id, language, pendingAssistantId, (turn) => ({
        ...turn,
        content: uiError.message,
        timestamp: new Date().toISOString(),
        pending: false,
        error: true
      }));
      this.assistantSession.setChatPending(field.id, language, false);
      this.assistantSession.setError(field.id, language, null);
    }
  }

  private async ensureExplanation(
    field: PermitFieldDefinition,
    language: SupportedLanguage,
    force = false
  ): Promise<void> {
    const currentState = this.assistantSession.read(field.id, language);

    if (!force && (currentState.explanationStatus === 'ready' || currentState.explanationStatus === 'loading')) {
      return;
    }

    this.assistantSession.setExplanationLoading(field.id, language);

    try {
      const explanation = await firstValueFrom(this.assistantService.explainField(field, language));
      this.assistantSession.setExplanation(field.id, language, explanation);
    } catch (error) {
      this.assistantSession.setExplanationError(
        field.id,
        language,
        this.assistantService.toUiError(error, 'The assistant could not load guidance for this field.')
      );
    }
  }
}

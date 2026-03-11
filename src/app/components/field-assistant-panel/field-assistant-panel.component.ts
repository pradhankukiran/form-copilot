import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';

import type { AssistantFieldState } from '../../models/assistant-ui';
import type { PermitFieldDefinition } from '../../models/form-models';

@Component({
  selector: 'app-field-assistant-panel',
  imports: [
    ButtonModule,
    DividerModule,
    DrawerModule,
    MessageModule,
    ProgressSpinnerModule,
    SkeletonModule,
    TextareaModule
  ],
  templateUrl: './field-assistant-panel.component.html',
  styleUrl: './field-assistant-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldAssistantPanelComponent {
  readonly visible = input(false);
  readonly field = input<PermitFieldDefinition | null>(null);
  readonly fieldState = input<AssistantFieldState | null>(null);

  readonly visibleChange = output<boolean>();
  readonly retryExplain = output<void>();
  readonly sendMessage = output<string>();

  protected readonly draftMessage = signal('');
  protected readonly assistantPanel = viewChild<ElementRef<HTMLElement>>('assistantPanel');

  constructor() {
    effect(() => {
      const state = this.fieldState();
      const isVisible = this.visible();
      this.field()?.id;

      if (!state || !isVisible) {
        return;
      }

      state.chatTurns.length;
      state.chatPending;

      queueMicrotask(() => {
        const panel = this.assistantPanel()?.nativeElement;
        if (panel) {
          if (typeof panel.scrollTo === 'function') {
            panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
            return;
          }

          panel.scrollTop = panel.scrollHeight;
        }
      });
    });
  }

  protected closePanel(): void {
    this.visibleChange.emit(false);
  }

  protected updateDraft(value: string): void {
    this.draftMessage.set(value);
  }

  protected submitMessage(): void {
    const draft = this.draftMessage().trim();
    if (!draft) {
      return;
    }

    this.sendMessage.emit(draft);
    this.draftMessage.set('');
  }

  protected handleComposerEnter(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.submitMessage();
  }
}

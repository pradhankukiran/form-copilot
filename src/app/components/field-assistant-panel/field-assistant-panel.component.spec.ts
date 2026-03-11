import { TestBed } from '@angular/core/testing';

import type { AssistantFieldState } from '../../models/assistant-ui';
import type { PermitFieldDefinition } from '../../models/form-models';
import { FieldAssistantPanelComponent } from './field-assistant-panel.component';

const field: PermitFieldDefinition = {
  id: 'parcelNumber',
  controlName: 'parcelNumber',
  sectionId: 'property',
  kind: 'text',
  label: 'Parcel number',
  questionText: 'Enter the parcel number of the property where the work will take place.',
  helpText: 'Use the assessor or property record number exactly as it appears on official documents.',
  contextLine: 'Context-aware help for the parcel identifier field.',
  placeholder: 'Example: 17-042-219-000',
  required: true,
  sampleAnswer: '17-042-219-000'
};

function createState(chatTurns: AssistantFieldState['chatTurns']): AssistantFieldState {
  return {
    explanationStatus: 'ready',
    explanation: {
      whatThisMeans: 'What this field means.',
      whyAsked: 'Why the reviewer needs it.',
      whatToEnter: 'What the applicant should enter.',
      examples: ['17-042-219-000'],
      commonMistakes: ['Leaving out dashes']
    },
    chatTurns,
    chatPending: false,
    error: null
  };
}

function flushMicrotask(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe('FieldAssistantPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldAssistantPanelComponent]
    }).compileComponents();
  });

  it('renders assistant replies from the sidebar chat state', () => {
    const fixture = TestBed.createComponent(FieldAssistantPanelComponent);

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput(
      'fieldState',
      createState([
        {
          id: 'assistant-1',
          role: 'assistant',
          content: 'Use the parcel number exactly as shown on the assessor record.',
          timestamp: '2026-03-11T12:00:00.000Z'
        }
      ])
    );

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.chat-turn p')?.textContent).toContain(
      'Use the parcel number exactly as shown on the assessor record.'
    );
  });

  it('emits close when the custom header button is clicked', () => {
    const fixture = TestBed.createComponent(FieldAssistantPanelComponent);
    const emitted: boolean[] = [];

    fixture.componentInstance.visibleChange.subscribe((value) => emitted.push(value));
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('fieldState', createState([]));
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.assistant-panel__close') as HTMLButtonElement;
    closeButton.click();

    expect(emitted.at(-1)).toBe(false);
  });

  it('scrolls the whole sidebar when new turns are appended', async () => {
    const fixture = TestBed.createComponent(FieldAssistantPanelComponent);

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput(
      'fieldState',
      createState([
        {
          id: 'user-1',
          role: 'user',
          content: 'What format should I use?',
          timestamp: '2026-03-11T12:00:00.000Z'
        }
      ])
    );

    fixture.detectChanges();
    await fixture.whenStable();
    await flushMicrotask();

    const panel = fixture.nativeElement.querySelector('.assistant-panel') as HTMLElement;
    const scrollCalls: Array<[ScrollToOptions]> = [];
    Object.defineProperty(panel, 'scrollHeight', {
      configurable: true,
      value: 240
    });
    panel.scrollTo = ((options?: ScrollToOptions | number, y?: number) => {
      if (typeof options === 'object' && options !== null) {
        scrollCalls.push([options]);
        return;
      }

      scrollCalls.push([
        {
          left: typeof options === 'number' ? options : undefined,
          top: typeof y === 'number' ? y : undefined
        }
      ]);
    }) as typeof panel.scrollTo;

    fixture.componentRef.setInput(
      'fieldState',
      createState([
        {
          id: 'user-1',
          role: 'user',
          content: 'What format should I use?',
          timestamp: '2026-03-11T12:00:00.000Z'
        },
        {
          id: 'assistant-1',
          role: 'assistant',
          content: 'Use the format shown on the assessor record.',
          timestamp: '2026-03-11T12:00:01.000Z'
        }
      ])
    );

    fixture.detectChanges();
    await fixture.whenStable();
    await flushMicrotask();

    expect(scrollCalls.length).toBeGreaterThan(0);
    expect(scrollCalls.at(-1)).toEqual([{ top: 240, behavior: 'smooth' }]);
  });
});

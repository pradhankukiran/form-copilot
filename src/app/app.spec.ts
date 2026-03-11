import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import { SAMPLE_PERMIT_FIELDS } from './data/sample-permit-fields';
import { AssistantService } from './services/assistant.service';

const assistantServiceStub: Partial<AssistantService> = {
  languageOptions: [{ code: 'en', label: 'English', nativeLabel: 'English' }],
  explainField: () =>
    of({
      whatThisMeans: 'What this field means.',
      whyAsked: 'Why the reviewer needs it.',
      whatToEnter: 'What the applicant should enter.',
      examples: ['17-042-219-000'],
      commonMistakes: ['Leaving out dashes']
    }),
  sendFollowUp: () =>
    of({
      reply: 'Use the parcel number exactly as it appears on the assessor record.',
      meta: {
        provider: 'groq',
        model: 'test-model',
        language: 'en'
      }
    }),
  toUiError: (_error: unknown, fallbackMessage: string) => ({
    code: 'SERVER' as const,
    message: fallbackMessage,
    retryable: true
  })
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: AssistantService, useValue: assistantServiceStub }]
    }).compileComponents();
  });

  it('creates the prototype shell', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('renders the three form sections and sample fields', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.form-section').length).toBe(3);
    expect(element.querySelectorAll('.field-card').length).toBe(6);
  });

  it('shows the follow-up chat reply in the sidebar after a chat response', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    fixture.detectChanges();

    await app.openAssistant(SAMPLE_PERMIT_FIELDS[0]);
    fixture.detectChanges();
    await fixture.whenStable();

    await app.submitFollowUp('What format should I use?');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const chatTurns = Array.from(element.querySelectorAll('.chat-turn p')).map((node) => node.textContent?.trim());

    expect(chatTurns).toContain('Use the parcel number exactly as it appears on the assessor record.');
  });
});

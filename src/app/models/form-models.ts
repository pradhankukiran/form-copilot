export type PermitFieldKind = 'text' | 'select' | 'currency' | 'date' | 'textarea' | 'boolean';

export interface SelectOption {
  label: string;
  value: string;
}

export interface PermitFieldDefinition {
  id: string;
  controlName: string;
  sectionId: PermitFormSection['id'];
  kind: PermitFieldKind;
  label: string;
  questionText: string;
  helpText?: string;
  contextLine: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  sampleAnswer?: string;
  booleanLabel?: string;
}

export interface PermitFormSection {
  id: 'property' | 'project' | 'declaration';
  eyebrow: string;
  title: string;
  description: string;
}

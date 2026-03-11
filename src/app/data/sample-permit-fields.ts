import type { LanguageOption } from '../models/assistant-ui';
import type { PermitFieldDefinition, PermitFormSection } from '../models/form-models';

export const SAMPLE_PERMIT_SECTIONS: PermitFormSection[] = [
  {
    id: 'property',
    eyebrow: 'Property details',
    title: 'Locate the structure and define its type',
    description: 'These fields help the reviewing team identify the site and the kind of structure affected by the work.'
  },
  {
    id: 'project',
    eyebrow: 'Project details',
    title: 'Describe the scope, value, and timing of the work',
    description: 'These answers establish what work is planned, how extensive it is, and when the applicant expects to complete it.'
  },
  {
    id: 'declaration',
    eyebrow: 'Applicant declaration',
    title: 'Confirm occupancy and project context',
    description: 'This section captures a quick confirmation that can affect documentation needs and inspection routing.'
  }
];

export const SAMPLE_PERMIT_FIELDS: PermitFieldDefinition[] = [
  {
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
  },
  {
    id: 'structureType',
    controlName: 'structureType',
    sectionId: 'property',
    kind: 'select',
    label: 'Structure type',
    questionText: 'Select the type of structure where the project is being performed.',
    helpText: 'Pick the option that best reflects the primary structure, not accessory site items.',
    contextLine: 'Context-aware help for the structure classification field.',
    placeholder: 'Select a structure type',
    required: true,
    options: [
      { label: 'Single-family home', value: 'single-family' },
      { label: 'Townhome or duplex', value: 'townhome' },
      { label: 'Multi-unit residential building', value: 'multi-unit' },
      { label: 'Commercial property', value: 'commercial' }
    ],
    sampleAnswer: 'Single-family home'
  },
  {
    id: 'contractPrice',
    controlName: 'contractPrice',
    sectionId: 'project',
    kind: 'currency',
    label: 'Job value / contract price',
    questionText: 'Provide the total contract value for the work described in this application.',
    helpText: 'Include labor, materials, and related contracted work that is part of this permit request.',
    contextLine: 'Context-aware help for the project valuation field.',
    placeholder: '25,000',
    required: true,
    sampleAnswer: '$25,000'
  },
  {
    id: 'targetCompletionDate',
    controlName: 'targetCompletionDate',
    sectionId: 'project',
    kind: 'date',
    label: 'Target completion date',
    questionText: 'When do you expect the work associated with this permit to be substantially complete?',
    helpText: 'Use your best planning estimate; this does not automatically schedule inspections.',
    contextLine: 'Context-aware help for the estimated completion date field.',
    sampleAnswer: '2026-08-15'
  },
  {
    id: 'workDescription',
    controlName: 'workDescription',
    sectionId: 'project',
    kind: 'textarea',
    label: 'Job description',
    questionText: 'Describe the work being performed and the main systems or areas that will be affected.',
    helpText: 'Keep the description factual and specific. Mention key systems, locations, and scope boundaries.',
    contextLine: 'Context-aware help for the project description field.',
    placeholder: 'Example: Replace existing rooftop HVAC unit and reconnect controls on the east service wing.',
    required: true,
    sampleAnswer: 'Replace existing rooftop HVAC unit and reconnect controls on the east service wing.'
  },
  {
    id: 'ownerOccupied',
    controlName: 'ownerOccupied',
    sectionId: 'declaration',
    kind: 'boolean',
    label: 'Owner occupied property',
    questionText: 'Indicate whether the property is currently occupied by the owner.',
    helpText: 'Occupancy status can affect documentation and inspection expectations for some permit types.',
    contextLine: 'Context-aware help for the owner occupancy confirmation field.',
    booleanLabel: 'Yes, the owner currently occupies the property.',
    sampleAnswer: 'Yes'
  }
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' }
];

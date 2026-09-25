export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'month-or-present' | 'checkbox';
  placeholder?: string;
  hint?: string;
  options?: string[];
  bullets?: boolean;
  wide?: boolean;
}

export const LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

export const experienceConfig: FieldConfig[] = [
  {
    key: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Infosys',
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'text',
    placeholder: 'Software Engineer',
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Bengaluru, India',
    wide: true,
  },
  {
    key: 'start',
    label: 'Start Date',
    type: 'text',
    placeholder: 'Jun 2022',
  },
  {
    key: 'end',
    label: 'End Date',
    type: 'month-or-present',
    placeholder: 'Present',
  },
  {
    key: 'description',
    label: 'Responsibilities',
    type: 'textarea',
    placeholder: '• Start lines with a bullet to create a list\n• Or write a paragraph normally\n• Mixing bullets and text is fine',
    hint: 'Start lines with • to create bullet points. Press Enter to continue the list.',
    bullets: true,
    wide: true,
  },
];

export const educationConfig: FieldConfig[] = [
  {
    key: 'degree',
    label: 'Degree / Course',
    type: 'text',
    placeholder: 'B.Tech Computer Science',
    wide: true,
  },
  {
    key: 'institution',
    label: 'Institution',
    type: 'text',
    placeholder: 'IIT Bombay',
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Mumbai',
  },
  {
    key: 'start',
    label: 'Start Year',
    type: 'text',
    placeholder: '2019',
  },
  {
    key: 'end',
    label: 'End Year',
    type: 'month-or-present',
    placeholder: '2023',
  },
  {
    key: 'description',
    label: 'Notes (GPA / Achievements)',
    type: 'text',
    placeholder: 'CGPA: 8.5 / Scholarship recipient',
    wide: true,
  },
];

export const projectsConfig: FieldConfig[] = [
  {
    key: 'name',
    label: 'Project Name',
    type: 'text',
    placeholder: 'E-commerce Platform',
    wide: true,
  },
  {
    key: 'tech',
    label: 'Technologies Used',
    type: 'text',
    placeholder: 'React, Node.js, MongoDB',
    wide: true,
  },
  {
    key: 'url',
    label: 'Project URL (optional)',
    type: 'text',
    placeholder: 'github.com/username/project',
    wide: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: '• Start lines with a bullet to create a list\n• Or write a paragraph normally\n• Mixing bullets and text is fine',
    hint: 'Start lines with • to create bullet points. Press Enter to continue the list.',
    bullets: true,
    wide: true,
  },
];

export const certificationsConfig: FieldConfig[] = [
  {
    key: 'name',
    label: 'Certification Name',
    type: 'text',
    placeholder: 'AWS Cloud Practitioner',
  },
  {
    key: 'org',
    label: 'Issuing Organization',
    type: 'text',
    placeholder: 'Amazon Web Services',
  },
  {
    key: 'year',
    label: 'Year',
    type: 'text',
    placeholder: '2024',
  },
  {
    key: 'url',
    label: 'Credential URL (optional)',
    type: 'text',
    placeholder: 'credly.com/badges/...',
  },
];

export const languagesConfig: FieldConfig[] = [
  {
    key: 'lang',
    label: 'Language',
    type: 'text',
    placeholder: 'Hindi',
  },
  {
    key: 'level',
    label: 'Level',
    type: 'select',
    options: LEVELS,
  },
];

export const awardsConfig: FieldConfig[] = [
  {
    key: 'title',
    label: 'Award Title',
    type: 'text',
    placeholder: 'Spot Award',
  },
  {
    key: 'issuer',
    label: 'Issuer',
    type: 'text',
    placeholder: 'Infosys',
  },
  {
    key: 'year',
    label: 'Year',
    type: 'text',
    placeholder: '2023',
  },
  {
    key: 'description',
    label: 'Description (optional)',
    type: 'textarea',
    placeholder: 'Brief description of the award...',
    wide: true,
  },
];

export const customSectionItemConfig: FieldConfig[] = [
  {
    key: 'heading',
    label: 'Heading',
    type: 'text',
    placeholder: 'e.g. Project name or volunteering title',
  },
  {
    key: 'subheading',
    label: 'Subheading',
    type: 'text',
    placeholder: 'e.g. Organization or publication',
  },
  {
    key: 'date',
    label: 'Date',
    type: 'text',
    placeholder: 'e.g. Jan 2023 – Dec 2023',
    wide: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: '• Start lines with a bullet to create a list\n• Or write a paragraph normally\n• Mixing bullets and text is fine',
    hint: 'Start lines with • to create bullet points. Press Enter to continue the list.',
    bullets: true,
    wide: true,
  },
];
